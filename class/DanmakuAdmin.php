<?php
/** Moderation of the local danmaku store; responses contain no visitor identifiers. */
require_once __DIR__ . '/Danmaku.php';

final class DanmakuAdmin
{
    private const PAGE_SIZE = 25;
    private PDO $pdo;
    private bool $mysql;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        Danmaku::ensureSchema($pdo);
        $this->mysql = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';
    }

    private static function filterText($value, string $label, int $bytes, int $characters): string
    {
        if (!is_string($value) || strlen($value) > $bytes || preg_match('//u', $value) !== 1 ||
            preg_match('/[\x00-\x1f\x7f]/u', $value) || preg_match_all('/./us', $value) > $characters) {
            throw new InvalidArgumentException($label . '格式或长度不正确');
        }
        return $value;
    }

    private static function positiveDecimal($value, string $label): string
    {
        if ((!is_int($value) && !is_string($value)) ||
            !preg_match('/\A[1-9][0-9]*\z/', (string) $value)) {
            throw new InvalidArgumentException($label . '应为正整数');
        }
        return (string) $value;
    }

    /** Compare decimal strings without float conversion or platform-dependent overflow. */
    private static function compareDecimal(string $left, string $right): int
    {
        return (strlen($left) <=> strlen($right)) ?: strcmp($left, $right);
    }

    private function summary(): array
    {
        $row = $this->pdo->query('SELECT
            (SELECT COUNT(*) FROM xplayer_danmaku) AS comments,
            (SELECT COUNT(DISTINCT player_key) FROM xplayer_danmaku) AS videos,
            (SELECT COUNT(*) FROM xplayer_danmaku_reports) AS reports,
            (SELECT COUNT(*) FROM xplayer_danmaku d WHERE EXISTS
                (SELECT 1 FROM xplayer_danmaku_reports r WHERE r.comment_id = d.id)) AS reportedComments'
        )->fetch(PDO::FETCH_ASSOC);
        return array_map('intval', $row);
    }

    public function browse(array $filters = []): array
    {
        $where = [];
        $parameters = [];
        if (array_key_exists('keyword', $filters)) {
            $keyword = self::filterText($filters['keyword'], '搜索内容', 1200, 300);
            if ($keyword !== '') {
                // An explicit escape character is portable across MySQL and SQLite.
                $pattern = '%' . strtr($keyword, ['!' => '!!', '%' => '!%', '_' => '!_']) . '%';
                $where[] = "(d.content LIKE ? ESCAPE '!' OR d.author LIKE ? ESCAPE '!')";
                array_push($parameters, $pattern, $pattern);
            }
        }
        if (array_key_exists('player', $filters)) {
            $player = self::filterText($filters['player'], '视频编号', 768, 255);
            if ($player !== '') {
                $where[] = 'd.player_key = ?';
                $parameters[] = hash('sha256', $player);
            }
        }
        if (array_key_exists('reported', $filters)) {
            if (!in_array($filters['reported'], [0, 1, '0', '1'], true)) {
                throw new InvalidArgumentException('举报筛选值不正确');
            }
            if ((string) $filters['reported'] === '1') {
                $where[] = 'EXISTS (SELECT 1 FROM xplayer_danmaku_reports r WHERE r.comment_id = d.id)';
            }
        }
        $requestedPage = self::positiveDecimal(array_key_exists('page', $filters) ? $filters['page'] : 1, '页码');
        $condition = $where ? ' WHERE ' . implode(' AND ', $where) : '';

        // Keep counts, page contents and report details in the same read snapshot.
        $ownsTransaction = !$this->pdo->inTransaction();
        if ($ownsTransaction) $this->pdo->beginTransaction();
        try {
            $query = $this->pdo->prepare('SELECT COUNT(*) FROM xplayer_danmaku d' . $condition);
            $query->execute($parameters);
            $total = (int) $query->fetchColumn();
            $pages = max(1, intdiv($total, self::PAGE_SIZE) + ($total % self::PAGE_SIZE === 0 ? 0 : 1));
            $page = self::compareDecimal($requestedPage, (string) $pages) > 0 ? $pages : (int) $requestedPage;

            $summary = $this->summary();

            $query = $this->pdo->prepare('SELECT d.id, d.player_id, d.video_time, d.mode, d.color,
                d.author, d.content, d.created_at,
                (SELECT COUNT(*) FROM xplayer_danmaku_reports r WHERE r.comment_id = d.id) AS report_count
                FROM xplayer_danmaku d' . $condition . ' ORDER BY d.id DESC LIMIT 25 OFFSET ?');
            foreach ($parameters as $index => $value) $query->bindValue($index + 1, $value, PDO::PARAM_STR);
            $query->bindValue(count($parameters) + 1, ($page - 1) * self::PAGE_SIZE, PDO::PARAM_INT);
            $query->execute();
            $rows = $query->fetchAll(PDO::FETCH_ASSOC);

            // Reuse a bounded query per item, including on installations with MySQL 5.7.
            $reportQuery = $this->pdo->prepare('SELECT id, reason, created_at FROM xplayer_danmaku_reports
                WHERE comment_id = ? ORDER BY created_at DESC, id DESC LIMIT 10');
            $items = [];
            foreach ($rows as $row) {
                $reports = [];
                if ((int) $row['report_count'] > 0) {
                    $reportQuery->execute([(string) $row['id']]);
                    while ($report = $reportQuery->fetch(PDO::FETCH_ASSOC)) {
                        $reports[] = ['id' => (string) $report['id'], 'reason' => (string) $report['reason'],
                            'createdAt' => (int) $report['created_at']];
                    }
                }
                $items[] = [
                    'id' => (string) $row['id'], 'playerId' => (string) $row['player_id'],
                    'time' => (float) $row['video_time'], 'mode' => (string) $row['mode'],
                    'color' => (string) $row['color'], 'author' => (string) $row['author'],
                    'content' => (string) $row['content'], 'createdAt' => (int) $row['created_at'],
                    'reportCount' => (int) $row['report_count'], 'reports' => $reports,
                ];
            }
            if ($ownsTransaction) $this->pdo->commit();
            return ['items' => $items, 'page' => $page, 'pageSize' => self::PAGE_SIZE,
                'pages' => $pages, 'total' => $total, 'summary' => $summary];
        } catch (Throwable $error) {
            if ($ownsTransaction && $this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }

    public function groups(array $filters = []): array
    {
        $where = '';
        $parameters = [];
        if (array_key_exists('keyword', $filters)) {
            $keyword = self::filterText($filters['keyword'], '视频编号', 768, 255);
            if ($keyword !== '') {
                $where = " WHERE d.player_id LIKE ? ESCAPE '!'";
                $parameters[] = '%' . strtr($keyword, ['!' => '!!', '%' => '!%', '_' => '!_']) . '%';
            }
        }
        $reported = $filters['reported'] ?? 0;
        if (array_key_exists('reported', $filters) && !in_array($filters['reported'], [0, 1, '0', '1'], true)) {
            throw new InvalidArgumentException('举报筛选值不正确');
        }
        $requestedPage = self::positiveDecimal(array_key_exists('page', $filters) ? $filters['page'] : 1, '页码');
        // One report aggregate per comment prevents report joins from multiplying
        // comment counts. MIN(player_id) also works with MySQL ONLY_FULL_GROUP_BY.
        $grouped = 'SELECT d.player_key, MIN(d.player_id) AS player_id, COUNT(*) AS comments,
            SUM(COALESCE(r.report_count, 0)) AS reports, MAX(d.created_at) AS latest_at
            FROM xplayer_danmaku d LEFT JOIN
                (SELECT comment_id, COUNT(*) AS report_count FROM xplayer_danmaku_reports GROUP BY comment_id) r
                ON r.comment_id = d.id' . $where . ' GROUP BY d.player_key' .
            ((string) $reported === '1' ? ' HAVING SUM(COALESCE(r.report_count, 0)) > 0' : '');

        $ownsTransaction = !$this->pdo->inTransaction();
        if ($ownsTransaction) $this->pdo->beginTransaction();
        try {
            $query = $this->pdo->prepare('SELECT COUNT(*) FROM (' . $grouped . ') video_groups');
            $query->execute($parameters);
            $total = (int) $query->fetchColumn();
            $pages = max(1, intdiv($total, self::PAGE_SIZE) + ($total % self::PAGE_SIZE === 0 ? 0 : 1));
            $page = self::compareDecimal($requestedPage, (string) $pages) > 0 ? $pages : (int) $requestedPage;
            $summary = $this->summary();
            $query = $this->pdo->prepare($grouped . ' ORDER BY latest_at DESC, d.player_key ASC LIMIT 25 OFFSET ?');
            foreach ($parameters as $index => $value) $query->bindValue($index + 1, $value, PDO::PARAM_STR);
            $query->bindValue(count($parameters) + 1, ($page - 1) * self::PAGE_SIZE, PDO::PARAM_INT);
            $query->execute();
            $items = [];
            while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
                $items[] = ['key' => (string) $row['player_key'], 'playerId' => (string) $row['player_id'],
                    'comments' => (int) $row['comments'], 'reports' => (int) $row['reports'],
                    'latestAt' => (int) $row['latest_at']];
            }
            if ($ownsTransaction) $this->pdo->commit();
            return ['items' => $items, 'page' => $page, 'pageSize' => self::PAGE_SIZE,
                'pages' => $pages, 'total' => $total, 'summary' => $summary];
        } catch (Throwable $error) {
            if ($ownsTransaction && $this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }

    public function clearGroups(array $keys): array
    {
        if (!$keys || count($keys) > 25) throw new InvalidArgumentException('每次请选择 1 至 25 个视频');
        foreach ($keys as &$key) {
            if (!is_string($key) || !preg_match('/\A[0-9a-f]{64}\z/i', $key)) {
                throw new InvalidArgumentException('视频分组标识无效');
            }
            $key = strtolower($key);
        }
        unset($key);
        $keys = array_values(array_unique($keys, SORT_STRING));
        sort($keys, SORT_STRING);
        $placeholders = implode(',', array_fill(0, count($keys), '?'));
        $this->pdo->beginTransaction();
        try {
            $lock = $this->pdo->prepare('SELECT id, player_key FROM xplayer_danmaku
                WHERE player_key IN (' . $placeholders . ') ORDER BY id' . ($this->mysql ? ' FOR UPDATE' : ''));
            $lock->execute($keys);
            $ids = [];
            $groups = [];
            while ($row = $lock->fetch(PDO::FETCH_ASSOC)) {
                $ids[] = (string) $row['id'];
                $groups[(string) $row['player_key']] = true;
            }
            $result = ['groups' => count($groups), 'comments' => 0, 'reports' => 0];
            // Delete only this locked snapshot. New comments in the same video
            // remain valid, and their reports must not be swept up by a group DELETE.
            for ($offset = 0, $count = count($ids); $offset < $count; $offset += 500) {
                $batch = array_slice($ids, $offset, 500);
                $batchParameters = implode(',', array_fill(0, count($batch), '?'));
                $query = $this->pdo->prepare('DELETE FROM xplayer_danmaku_reports WHERE comment_id IN (' . $batchParameters . ')');
                $query->execute($batch);
                $result['reports'] += $query->rowCount();
                $query = $this->pdo->prepare('DELETE FROM xplayer_danmaku WHERE id IN (' . $batchParameters . ')');
                $query->execute($batch);
                $result['comments'] += $query->rowCount();
            }
            $this->pdo->commit();
            return $result;
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }

    private static function ids(array $ids): array
    {
        if (!$ids || count($ids) > 100) throw new InvalidArgumentException('每次请选择 1 至 100 条弹幕');
        $validated = [];
        foreach ($ids as $id) {
            $id = self::positiveDecimal($id, '弹幕编号');
            // Both SQLite IDs and the shared reports.comment_id column are signed integers.
            if (self::compareDecimal($id, (string) PHP_INT_MAX) > 0) {
                throw new InvalidArgumentException('弹幕编号超出范围');
            }
            $validated[] = $id;
        }
        $validated = array_values(array_unique($validated, SORT_STRING));
        usort($validated, [self::class, 'compareDecimal']);
        return $validated;
    }

    private function moderate(array $ids, bool $deleteComments): int
    {
        $ids = self::ids($ids);
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $this->pdo->beginTransaction();
        try {
            // report() obtains the same row lock before inserting a report. Ordered
            // locks also give overlapping moderator batches a consistent lock order.
            $lock = $this->pdo->prepare('SELECT id FROM xplayer_danmaku WHERE id IN (' . $placeholders .
                ') ORDER BY id' . ($this->mysql ? ' FOR UPDATE' : ''));
            $lock->execute($ids);
            $lock->fetchAll(PDO::FETCH_COLUMN);
            $query = $this->pdo->prepare('DELETE FROM xplayer_danmaku_reports WHERE comment_id IN (' . $placeholders . ')');
            $query->execute($ids);
            $affected = $query->rowCount();
            if ($deleteComments) {
                $query = $this->pdo->prepare('DELETE FROM xplayer_danmaku WHERE id IN (' . $placeholders . ')');
                $query->execute($ids);
                $affected = $query->rowCount();
            }
            $this->pdo->commit();
            return $affected;
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }

    /** Return the number of deleted comments, including when some IDs no longer exist. */
    public function delete(array $ids): int
    {
        return $this->moderate($ids, true);
    }

    /** Return the number of cleared reports while retaining every comment. */
    public function dismissReports(array $ids): int
    {
        return $this->moderate($ids, false);
    }
}
