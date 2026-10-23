<?php
require_once dirname(__DIR__) . '/class/Security.php';
try {
    Security::session();
    require dirname(__DIR__) . '/config.php';
    header('Cache-Control: no-store');
    $method = Security::text($_POST['method'] ?? ($_GET['method'] ?? ''), 40);
    if (in_array($method, ['u', 'Settle', 'ChangeInfo', 'Register'], true)) {
        Security::respond(['code' => 410, 'msg' => '此接口不可用'], 410);
    }
    Security::requirePost();
    Security::requireCsrf();
    if ($method === 'Login') {
        if (!Security::credentials()) Security::respond(['code' => 503, 'msg' => '管理员账号尚未配置，请完成站点安装或联系站点维护者'], 503);
        $username = Security::text($_POST['account_u'] ?? '', 64);
        $password = Security::text($_POST['account_p'] ?? '', 72);
        if (!Security::login($username, $password)) Security::respond(['code' => 401, 'msg' => '账号或密码错误，或登录尝试过于频繁'], 401);
        Security::respond(['code' => 200, 'msg' => '登录成功']);
    }
    Security::requireAdmin();
    if (in_array($method, ['DanmakuList', 'DanmakuDelete', 'DanmakuDismissReports', 'DanmakuGroups', 'DanmakuClearGroups'], true)) {
        require_once dirname(__DIR__) . '/class/DanmakuAdmin.php';
        $moderation = new DanmakuAdmin($conn);
        if ($method === 'DanmakuList') {
            $filters = array_intersect_key($_POST, array_flip(['keyword', 'player', 'reported', 'page']));
            Security::respond(['code' => 200, 'data' => $moderation->browse($filters)]);
        }
        if ($method === 'DanmakuGroups') {
            $filters = array_intersect_key($_POST, array_flip(['keyword', 'reported', 'page']));
            Security::respond(['code' => 200, 'data' => $moderation->groups($filters)]);
        }
        if ($method === 'DanmakuClearGroups') {
            $keys = $_POST['keys'] ?? null;
            if (!is_array($keys)) throw new InvalidArgumentException('请选择需要清空的视频分组');
            $affected = $moderation->clearGroups($keys);
            Security::respond(['code' => 200, 'affected' => $affected, 'msg' =>
                '已处理 ' . $affected['groups'] . ' 个分组，删除 ' . $affected['comments'] . ' 条弹幕及 ' . $affected['reports'] . ' 条举报']);
        }
        $ids = $_POST['ids'] ?? null;
        if (!is_array($ids)) throw new InvalidArgumentException('请选择需要处理的弹幕');
        $deleting = $method === 'DanmakuDelete';
        $affected = $deleting ? $moderation->delete($ids) : $moderation->dismissReports($ids);
        Security::respond(['code' => 200, 'affected' => $affected,
            'msg' => $deleting ? '已删除 ' . $affected . ' 条弹幕及其关联举报' : '已清除 ' . $affected . ' 条举报，弹幕正文已保留']);
    }
    if ($method === 'ChangePassword') {
        Security::changePassword(
            Security::text($_POST['current_password'] ?? '', 72),
            Security::text($_POST['new_password'] ?? '', 72),
            Security::text($_POST['confirm_password'] ?? '', 72)
        );
        Security::respond(['code' => 200, 'msg' => '管理员密码已修改，请使用新密码重新登录', 'redirect' => 'index.php']);
    }
    if ($method === 'DashBoard') {
        $size = $_POST['size'] ?? '7';
        if (!is_scalar($size) || !ctype_digit((string) $size) || (int) $size < 1 || (int) $size > 366) {
            throw new InvalidArgumentException('统计天数应为 1–366');
        }
        Security::respond(array_map(static fn($row) => ['time' => $row['time'], 'use' => (int) $row['use'], 'useok' => (int) $row['useok']], Statistics::dashboard($conn, (int) $size)));
    }
    if ($method === 'SaveSettings') {
        $section = Security::text($_POST['section'] ?? '', 20);
        $data = $_POST['data'] ?? null;
        if (!is_array($data)) throw new InvalidArgumentException('设置内容必须为对象');
        $writes = [];
        $boolean = static function ($value): int {
            if (!in_array($value, [0, 1, '0', '1'], true)) throw new InvalidArgumentException('开关值不正确');
            return (int) $value;
        };
        if ($section === 'player') {
            $keys = ['title','logo','ico','img','themeColor','autoplay','danmuon','showlist','home404','devtoolsGuard','devtoolsGuardMode','cdnEnabled','cdnRef','notice','bad','forbidden','button','startAD','pauseAD'];
            $partial = array_intersect_key($data, array_flip($keys));
            $writes[] = ['user', Settings::validateUser($partial, $user), false];
            if (array_key_exists('ad', $data)) $writes[] = ['ad', $boolean($data['ad']), false];
        } elseif ($section === 'interfaces') {
            $partial = array_intersect_key($data, array_flip(['metadataApi','danmuku','danmakuCreateApis','danmakuLocalFallback']));
            $writes[] = ['user', Settings::validateUser($partial, $user), false];
            foreach (['api','specialApi','zyapi','origin'] as $column) {
                if (array_key_exists($column, $data)) $writes[] = [$column, Settings::normalizeList(Security::text($data[$column], 50000), $column), false];
            }
            foreach (['async','zywlist'] as $column) if (array_key_exists($column, $data)) $writes[] = [$column, $boolean($data[$column]), false];
        } elseif ($section === 'danmaku') {
            $writes[] = ['user', Settings::validateUser([
                'danmakuBlockedWords' => $data['danmakuBlockedWords'] ?? null,
            ], $user), false];
        } elseif ($section === 'advanced') {
            if (array_key_exists('cacheTime', $data)) {
                $value = Security::text($data['cacheTime'], 5);
                if (!ctype_digit($value) || (int) $value > 86400) throw new InvalidArgumentException('缓存秒数应为 0–86400');
                $writes[] = ['cacheTime', (int) $value, false];
            }
            if (array_key_exists('secret', $data)) $writes[] = ['secret', $boolean($data['secret']), false];
            $key = Security::text($data['secretKEY'] ?? '', 128);
            if ($key !== '') {
                if (strlen($key) < 16) throw new InvalidArgumentException('播放密钥至少 16 字符，建议使用随机字符串');
                $writes[] = ['secretKEY', $key, true];
            }
        } else throw new InvalidArgumentException('未知设置分组');
        $conn->beginTransaction();
        try {
            foreach ($writes as [$column, $value, $safe]) Settings::save($conn, $column, $value, $safe);
            $conn->commit();
        } catch (Throwable $error) {
            if ($conn->inTransaction()) $conn->rollBack();
            throw $error;
        }
        Security::respond(['code' => 200, 'msg' => $section === 'danmaku'
            ? '屏蔽词已保存，对新发送的本地弹幕立即生效'
            : '设置已保存，刷新播放器后生效']);
    }
    $switches = ['c4' => 'async', 'c5' => 'secret', 'c9' => 'ad', 'c11' => 'zywlist'];
    $lists = ['c6' => 'specialApi', 'c7' => 'api', 'c8' => 'origin', 'c10' => 'zyapi'];
    if (isset($switches[$method])) {
        $value = $_POST['onoff'] ?? null;
        if (!in_array($value, [0, 1, '0', '1'], true)) throw new InvalidArgumentException('开关仅允许 0 或 1');
        Settings::save($conn, $switches[$method], (int) $value);
    } elseif (isset($lists[$method])) {
        $value = Security::text($_POST['value'] ?? '', 50000);
        Settings::save($conn, $lists[$method], Settings::normalizeList($value, $lists[$method]));
    } elseif ($method === 'c2') {
        $value = Security::text($_POST['value'] ?? '', 128);
        if (strlen($value) < 16) throw new InvalidArgumentException('播放密钥至少 16 字符，建议使用随机字符串');
        Settings::save($conn, 'secretKEY', $value, true);
    } elseif ($method === 'c3') {
        $value = Security::text($_POST['value'] ?? '', 5);
        if (!ctype_digit($value) || (int) $value > 86400) throw new InvalidArgumentException('缓存秒数应为 0–86400');
        Settings::save($conn, 'cacheTime', (int) $value);
    } elseif ($method === 'd') {
        $data = $_POST['data'] ?? null;
        if (!is_array($data)) throw new InvalidArgumentException('播放器配置必须为对象');
        Settings::save($conn, 'user', Settings::validateUser($data, $user));
    } else {
        Security::respond(['code' => 404, 'msg' => '未知管理接口'], 404);
    }
    Security::respond(['code' => 200, 'msg' => $method === 'c2' ? '密钥已保存，已打开的播放器需要刷新' : '已保存']);
} catch (InvalidArgumentException $error) {
    Security::respond(['code' => 400, 'msg' => $error->getMessage()], 400);
} catch (Throwable $error) {
    error_log('Xplayer administration: ' . $error->getMessage());
    Security::respond(['code' => 503, 'msg' => '后台服务尚未就绪，请检查安装、配置和服务器日志'], 503);
}
