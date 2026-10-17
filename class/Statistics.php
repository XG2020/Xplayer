<?php
/** Statistics never interpolate request values into SQL. */
final class Statistics
{
    public static function record(PDO $pdo, bool $success): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        $sql = $driver === 'sqlite'
            ? 'INSERT INTO xplayer_chart (`time`, `use`, useok, income) VALUES (?, 1, ?, 0) ON CONFLICT(`time`) DO UPDATE SET `use`=`use`+1, useok=useok+excluded.useok'
            : 'INSERT INTO xplayer_chart (`time`, `use`, useok, income) VALUES (?, 1, ?, 0) ON DUPLICATE KEY UPDATE `use`=`use`+1, useok=useok+VALUES(useok)';
        $pdo->prepare($sql)->execute([date('Y-m-d'), (int) $success]);
    }

    public static function dashboard(PDO $pdo, int $days): array
    {
        if ($days < 1 || $days > 366) throw new InvalidArgumentException('统计天数应为 1–366');
        $today = new DateTimeImmutable('today');
        $start = $today->modify('-' . ($days - 1) . ' days');
        $query = $pdo->prepare('SELECT `time`, `use`, useok, income FROM xplayer_chart WHERE `time` >= ? AND `time` <= ? ORDER BY `time`');
        $query->execute([$start->format('Y-m-d'), $today->format('Y-m-d')]);
        $stored = [];
        foreach ($query->fetchAll(PDO::FETCH_ASSOC) as $row) $stored[$row['time']] = $row;
        $result = [];
        for ($day = $start; $day <= $today; $day = $day->modify('+1 day')) {
            $date = $day->format('Y-m-d');
            $result[] = $stored[$date] ?? ['time' => $date, 'use' => 0, 'useok' => 0, 'income' => 0];
        }
        return $result;
    }

    public static function online(PDO $pdo): array
    {
        $now = time();
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        $referer = is_string($referer) ? substr($referer, 0, 250) : '';
        // Drop an incomplete UTF-8 tail rather than failing an utf8mb4 INSERT.
        while ($referer !== '' && preg_match('//u', $referer) !== 1) $referer = substr($referer, 0, -1);
        if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
            $sql = 'INSERT INTO WatchCount (IP, `time`, referer) VALUES (?, ?, ?) ON CONFLICT(IP) DO UPDATE SET `time`=excluded.`time`, referer=excluded.referer';
        } else {
            $sql = 'INSERT INTO WatchCount (IP, `time`, referer) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `time`=VALUES(`time`), referer=VALUES(referer)';
        }
        $pdo->prepare($sql)->execute([Security::clientIp(), $now, $referer]);
        $pdo->prepare('DELETE FROM WatchCount WHERE `time` < ?')->execute([$now - 300]);
        $query = $pdo->prepare('SELECT COUNT(*) FROM WatchCount WHERE `time` >= ?');
        $query->execute([$now - 300]);
        return ['num' => (int) $query->fetchColumn(), 'time' => $now];
    }
}
