<?php
/** Local, persistent implementation of the original player's code=23 danmaku API. */
require_once __DIR__ . '/Security.php';
require_once __DIR__ . '/DanmakuFilter.php';

final class DanmakuRateLimit extends RuntimeException {}

final class Danmaku
{
    private PDO $pdo;
    private string $key;
    private DanmakuFilter $filter;

    public function __construct(PDO $pdo, string $key, string $blockedWords = '')
    {
        if (strlen($key) < 16) throw new RuntimeException('弹幕服务密钥尚未初始化');
        $this->pdo = $pdo;
        $this->key = $key;
        $this->filter = new DanmakuFilter($blockedWords);
        self::ensureSchema($pdo);
    }

    /** Add only dedicated tables. Existing player data and settings are never changed. */
    public static function ensureSchema(PDO $pdo): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if (!in_array($driver, ['mysql', 'sqlite'], true)) throw new RuntimeException('不支持的弹幕数据库');
        $identity = $driver === 'mysql' ? 'BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
        $suffix = $driver === 'mysql' ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4' : '';
        $pdo->exec("CREATE TABLE IF NOT EXISTS xplayer_danmaku (
            id $identity, player_key CHAR(64) NOT NULL, player_id VARCHAR(255) NOT NULL,
            video_time DOUBLE NOT NULL, mode VARCHAR(8) NOT NULL, color VARCHAR(7) NOT NULL,
            author VARCHAR(128) NOT NULL, content TEXT NOT NULL, font_size VARCHAR(8) NOT NULL,
            client_hash CHAR(64) NOT NULL, created_at BIGINT NOT NULL" .
            ($driver === 'mysql' ? ', INDEX xplayer_dm_player_time (player_key, video_time)' : '') . ")$suffix");
        $pdo->exec("CREATE TABLE IF NOT EXISTS xplayer_danmaku_reports (
            id $identity, comment_id BIGINT NOT NULL, reporter_hash CHAR(64) NOT NULL,
            reason VARCHAR(120) NOT NULL, created_at BIGINT NOT NULL,
            UNIQUE (comment_id, reporter_hash))$suffix");
        $pdo->exec("CREATE TABLE IF NOT EXISTS xplayer_danmaku_limits (
            bucket CHAR(64) PRIMARY KEY, last_sent BIGINT NOT NULL)$suffix");
        if ($driver === 'sqlite') {
            $pdo->exec('CREATE INDEX IF NOT EXISTS xplayer_dm_player_time ON xplayer_danmaku (player_key, video_time)');
            $pdo->exec('PRAGMA busy_timeout=5000');
        }
    }

    private static function plain($value, string $label, int $bytes, int $characters): string
    {
        if (!is_string($value) || strlen($value) > $bytes || preg_match('//u', $value) !== 1 ||
            preg_match('/[\x00-\x1f\x7f]/u', $value)) {
            throw new InvalidArgumentException($label . '格式或长度不正确');
        }
        $value = preg_replace('/\A\s+|\s+\z/u', '', $value);
        if ($value === '' || preg_match_all('/./us', $value) > $characters) {
            throw new InvalidArgumentException($label . '不能为空或超出长度限制');
        }
        return $value;
    }

    private static function player($value): string
    {
        return self::plain($value, '视频编号', 768, 255);
    }

    private function client(string $ip): string
    {
        if (!filter_var($ip, FILTER_VALIDATE_IP)) throw new InvalidArgumentException('客户端地址无效');
        return hash_hmac('sha256', $ip, $this->key);
    }

    private static function color($value): string
    {
        if (!is_string($value)) throw new InvalidArgumentException('弹幕颜色无效');
        if (preg_match('/\A#[0-9a-f]{6}\z/i', $value)) return strtolower($value);
        if (preg_match('/\Argb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)\z/i', $value, $parts) &&
            max((int) $parts[1], (int) $parts[2], (int) $parts[3]) <= 255) {
            return sprintf('#%02x%02x%02x', (int) $parts[1], (int) $parts[2], (int) $parts[3]);
        }
        throw new InvalidArgumentException('弹幕颜色无效');
    }

    public function read($player, $maximum = 10000): array
    {
        $player = self::player($player);
        if (filter_var($maximum, FILTER_VALIDATE_INT) === false || (int) $maximum < 1 || (int) $maximum > 10000) {
            throw new InvalidArgumentException('弹幕数量应为 1 至 10000');
        }
        $query = $this->pdo->prepare('SELECT id, video_time, mode, color, author, content, created_at, font_size FROM xplayer_danmaku WHERE player_key = ? ORDER BY video_time, id LIMIT ' . (int) $maximum);
        $query->execute([hash('sha256', $player)]);
        $rows = [];
        while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
            // The legacy IP column now contains a comment identifier, never the visitor's address.
            $rows[] = [(float) $row['video_time'], $row['mode'], $row['color'], $row['author'], $row['content'],
                (string) $row['id'], gmdate('Y-m-d H:i:s', (int) $row['created_at']) . ' UTC', $row['font_size']];
        }
        return ['code' => 23, 'msg' => '获取成功', 'name' => $player, 'danum' => count($rows), 'danmuku' => $rows];
    }

    /** Call within the same transaction as the write so parallel requests cannot bypass the limit. */
    private function reserve(string $action, string $client, int $now, int $seconds): void
    {
        $bucket = hash('sha256', $action . ':' . $client);
        $mysql = $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';
        $insert = $this->pdo->prepare(($mysql ? 'INSERT IGNORE' : 'INSERT OR IGNORE') . ' INTO xplayer_danmaku_limits (bucket, last_sent) VALUES (?, 0)');
        $insert->execute([$bucket]);
        $query = $this->pdo->prepare('SELECT last_sent FROM xplayer_danmaku_limits WHERE bucket = ?' . ($mysql ? ' FOR UPDATE' : ''));
        $query->execute([$bucket]);
        $last = (int) $query->fetchColumn();
        if ($last > 0 && $now - $last < $seconds) throw new DanmakuRateLimit('请勿频繁操作，请等待 ' . $seconds . ' 秒后重试');
        $this->pdo->prepare('UPDATE xplayer_danmaku_limits SET last_sent = ? WHERE bucket = ?')->execute([$now, $bucket]);
    }

    public function send(array $data, string $ip, ?int $now = null): array
    {
        $player = self::player($data['player'] ?? null);
        $content = self::plain($data['text'] ?? null, '弹幕内容', 1200, 300);
        $author = self::plain($data['author'] ?? '游客', '昵称', 128, 40);
        if ($this->filter->matches($content) || $this->filter->matches($author)) {
            throw new InvalidArgumentException('弹幕内容或昵称不符合发送要求');
        }
        $time = $data['time'] ?? null;
        if ((!is_int($time) && !is_float($time)) || !is_finite((float) $time) || $time < 0 || $time > 604800) {
            throw new InvalidArgumentException('弹幕时间无效');
        }
        $mode = $data['type'] ?? 'right';
        if (!in_array($mode, ['right', 'top', 'bottom'], true)) throw new InvalidArgumentException('弹幕模式无效');
        $size = $data['size'] ?? '27.5px';
        if (!is_string($size) || !preg_match('/\A(\d{1,2}(?:\.5)?)px\z/', $size, $parts) || (float) $parts[1] < 12 || (float) $parts[1] > 50) {
            throw new InvalidArgumentException('弹幕字号无效');
        }
        $color = self::color($data['color'] ?? '#ffffff');
        $client = $this->client($ip);
        $now = $now ?? time();
        $this->pdo->beginTransaction();
        try {
            $this->reserve('send', $client, $now, 3);
            $query = $this->pdo->prepare('INSERT INTO xplayer_danmaku (player_key, player_id, video_time, mode, color, author, content, font_size, client_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $query->execute([hash('sha256', $player), $player, round((float) $time, 3), $mode, $color, $author, $content, $size, $client, $now]);
            $id = (string) $this->pdo->lastInsertId();
            $this->pdo->commit();
            return ['code' => 23, 'msg' => '发送成功', 'id' => $id];
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }

    public function report(array $data, string $ip, ?int $now = null): array
    {
        $reason = self::plain($data['type'] ?? null, '举报原因', 120, 30);
        if (!in_array($reason, ['违法违禁', '色情低俗', '恶意刷屏', '赌博诈骗', '人身攻击', '侵犯隐私', '垃圾广告', '剧透', '引战'], true)) {
            throw new InvalidArgumentException('举报原因无效');
        }
        $content = self::plain($data['text'] ?? null, '弹幕内容', 1200, 300);
        $author = self::plain($data['cid'] ?? null, '昵称', 128, 40);
        $player = self::player($data['title'] ?? null);
        $commentId = $data['user'] ?? '';
        if (!is_string($commentId) || !preg_match('/\A[1-9]\d{0,18}\z/', $commentId)) throw new InvalidArgumentException('弹幕编号无效');
        $client = $this->client($ip);
        $now = $now ?? time();
        $this->pdo->beginTransaction();
        try {
            $this->reserve('report', $client, $now, 3);
            $mysql = $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';
            // Serialize with moderation so a report cannot be inserted after its comment was deleted.
            $query = $this->pdo->prepare('SELECT id FROM xplayer_danmaku WHERE id = ? AND player_key = ? AND author = ? AND content = ?' . ($mysql ? ' FOR UPDATE' : ''));
            $query->execute([$commentId, hash('sha256', $player), $author, $content]);
            if (!$query->fetchColumn()) throw new InvalidArgumentException('未找到要举报的弹幕');
            $query = $this->pdo->prepare(($mysql ? 'INSERT IGNORE' : 'INSERT OR IGNORE') . ' INTO xplayer_danmaku_reports (comment_id, reporter_hash, reason, created_at) VALUES (?, ?, ?, ?)');
            $query->execute([$commentId, $client, $reason, $now]);
            $this->pdo->commit();
            return ['code' => 23, 'msg' => '举报已保存'];
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }
}
