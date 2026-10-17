<?php
require_once dirname(__DIR__) . '/class/Installer.php';
Security::session();
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
$installed = Installer::hasInstallation();
$requirements = Installer::requirements();
$missing = array_keys(array_filter($requirements, static fn($ready) => !$ready));
$tokenFile = XPLAYER_ROOT . '/includes/Setup.Token.php';
$tokenRequired = false;
$tokenError = '';
if (!$installed) {
    try { $tokenRequired = Installer::setupToken() !== null; }
    catch (Throwable $exception) { $tokenError = $exception->getMessage(); }
}
$error = ''; $success = false;
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    try {
        if ($installed) throw new RuntimeException('检测到已有安装或私有配置，禁止重新安装');
        Security::requireCsrf();
        if ($missing) throw new RuntimeException('请先完成页面中的环境检查');
        Installer::verifySetupToken(Security::text($_POST['setup_token'] ?? '', 200));
        $host = Security::text($_POST['db_host'] ?? '', 253);
        $database = Security::text($_POST['db_name'] ?? '', 64);
        $portText = Security::text($_POST['db_port'] ?? '3306', 5);
        if (!ctype_digit($portText)) throw new InvalidArgumentException('数据库端口无效');
        $dsn = Settings::dsn($host, $database, (int) $portText);
        $dbUser = Security::text($_POST['db_username'] ?? '', 128);
        $dbPassword = Security::text($_POST['db_password'] ?? '', 1000);
        if ($dbUser === '') throw new InvalidArgumentException('请填写数据库用户名');
        $username = Security::text($_POST['admin_username'] ?? '', 64);
        $password = Security::text($_POST['admin_password'] ?? '', 72);
        $confirmation = Security::text($_POST['admin_password_confirm'] ?? '', 72);
        if (!hash_equals($password, $confirmation)) throw new InvalidArgumentException('两次输入的管理员密码不一致');
        Security::validateCredentials($username, $password);
        $pdo = new PDO($dsn, $dbUser, $dbPassword, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 8]);
        Installer::complete($pdo, ['dsn' => $dsn, 'username' => $dbUser, 'password' => $dbPassword], $username, $password);
        $success = true; $installed = true;
        if (is_file($tokenFile)) @unlink($tokenFile);
        session_regenerate_id(true);
        unset($_SESSION['csrf']);
    } catch (PDOException $exception) {
        error_log('Xplayer installer database: ' . $exception->getMessage());
        $error = '数据库连接或初始化失败，请检查数据库信息、账号权限和服务器日志。已有数据表不会被覆盖。';
        http_response_code(400);
    } catch (Throwable $exception) {
        $error = $exception->getMessage();
        http_response_code(400);
    }
}
$field = static function (string $name, string $default = ''): string {
    $value = $_POST[$name] ?? $default;
    return Security::html(is_string($value) && strlen($value) <= 253 ? $value : $default);
};
?>
<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>安装 Xplayer</title>
<style>
*{box-sizing:border-box}body{max-width:800px;margin:48px auto;padding:0 24px;font:15px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;color:#253141;background:#f4f6fa}h1{margin:0 0 8px;font-size:30px;line-height:1.3}h2{margin:0 0 16px;font-size:18px}.intro{color:#627087;margin:0 0 24px}.card{background:#fff;border:1px solid #e1e7ef;padding:28px;border-radius:16px;box-shadow:0 6px 24px #25314106}.card+.card{margin-top:18px}fieldset{margin:0;padding:0;border:0}fieldset+fieldset{margin-top:28px;padding-top:24px;border-top:1px solid #e8edf3}legend{padding:0;margin-bottom:16px;font-size:18px;font-weight:650}.fields{display:grid;grid-template-columns:1fr 1fr;gap:16px}.wide{grid-column:1/-1}label{display:grid;gap:6px;font-weight:550}input,button,.button{font:inherit;border-radius:8px}input{width:100%;padding:10px 12px;border:1px solid #cbd5e1;color:#253141;background:#fff}input:focus{outline:3px solid #dce7ff;border-color:#376be6}small,.help{font-size:13px;color:#69758a;font-weight:400}.help{margin:8px 0 0}button,.button{display:inline-flex;justify-content:center;align-items:center;padding:11px 20px;background:#275cca;border:1px solid transparent;color:#fff;font-weight:600;text-decoration:none;cursor:pointer}button:disabled{opacity:.55;cursor:not-allowed}.submit{margin-top:26px;width:100%}.message{padding:14px 16px;border-radius:10px;margin:0 0 18px}.error{color:#9c2027;background:#fff0f1;border:1px solid #f1c6c9}.success{color:#176343;background:#edf9f3;border:1px solid #b8e5ce}ul{padding-left:22px;margin:8px 0}.environment{margin-bottom:18px;font-size:14px;color:#526078}.environment summary{cursor:pointer;font-weight:600}.environment .pass{color:#287452}.environment .fail{color:#a31c22}code{overflow-wrap:anywhere}@media(max-width:560px){body{margin:28px auto;padding:0 16px}.card{padding:22px 18px}.fields{grid-template-columns:1fr}h1{font-size:26px}}
</style></head><body>
<h1>安装 Xplayer</h1>
<?php if ($success): ?>
<p class="intro">站点已经准备好了。</p><section class="card"><p class="message success" role="status">安装成功，管理员账号已创建。</p><p>使用刚设置的管理员账号和密码登录后台，即可配置播放器。之后可在播放器设置中修改管理员密码。</p><a class="button" href="../admin/">进入后台登录</a></section>
<?php elseif ($installed): ?>
<p class="intro">检测到已有安装或私有配置，安装入口已锁定。</p><section class="card"><p>升级时保留原数据库、私有配置及 <code>install.lock</code>，无需重新安装。若上次安装未完成，请检查原配置并恢复备份。</p><a class="button" href="../admin/">进入后台</a></section>
<?php else: ?>
<p class="intro">准备好空数据库，填写连接信息并创建管理员账号，即可完成安装。</p>
<details class="environment" <?= $missing ? 'open' : '' ?>><summary>环境检查 · <?= $missing ? count($missing) . ' 项需要处理' : '全部通过' ?></summary><ul><?php foreach ($requirements as $label => $ready): ?><li class="<?= $ready ? 'pass' : 'fail' ?>"><?= $ready ? '✓' : '✕' ?> <?= Security::html($label) ?></li><?php endforeach; ?></ul><?php if ($missing): ?><p>请在服务器面板启用缺少的扩展或调整目录写入权限，然后刷新本页。</p><?php endif; ?></details>
<?php if ($error !== ''): ?><p class="message error" role="alert"><?= Security::html($error) ?></p><?php endif; ?>
<?php if ($tokenError !== ''): ?><p class="message error" role="alert"><?= Security::html($tokenError) ?></p><?php endif; ?>
<form method="post" class="card" id="install-form" autocomplete="off">
<input type="hidden" name="csrf" value="<?= Security::html(Security::csrfToken()) ?>">
<?php if ($tokenRequired): ?><fieldset><legend>安装验证</legend><label for="setup-token">安装密钥<input id="setup-token" name="setup_token" type="password" required minlength="32" maxlength="200"></label><p class="help">此站点已启用额外的安装验证，请输入预先配置的密钥。</p></fieldset><?php endif; ?>
<fieldset><legend>数据库连接</legend><div class="fields">
<label for="db-host">数据库主机<input id="db-host" name="db_host" value="<?= $field('db_host', 'localhost') ?>" maxlength="253" required></label>
<label for="db-port">端口<input id="db-port" name="db_port" type="number" value="<?= $field('db_port', '3306') ?>" min="1" max="65535" required></label>
<label class="wide" for="db-name">数据库名称<input id="db-name" name="db_name" value="<?= $field('db_name') ?>" maxlength="64" required></label>
<label for="db-username">数据库用户名<input id="db-username" name="db_username" value="<?= $field('db_username') ?>" maxlength="128" required></label>
<label for="db-password">数据库密码<input id="db-password" name="db_password" type="password" maxlength="1000"></label>
</div><p class="help">填写服务器面板中的数据库信息，已有播放器数据表不会被覆盖。</p></fieldset>
<fieldset><legend>创建管理员</legend><div class="fields">
<label class="wide" for="admin-username">管理员账号<input id="admin-username" name="admin_username" value="<?= $field('admin_username', 'admin') ?>" minlength="3" maxlength="64" pattern="[A-Za-z0-9_.@\-]{3,64}" required autocomplete="username"></label>
<label for="admin-password">管理员密码<input id="admin-password" name="admin_password" type="password" minlength="12" maxlength="72" required autocomplete="new-password" aria-describedby="password-help"></label>
<label for="admin-password-confirm">再次输入密码<input id="admin-password-confirm" name="admin_password_confirm" type="password" minlength="12" maxlength="72" required autocomplete="new-password"></label>
</div><p class="help" id="password-help">密码为 12–72 字节，建议使用独立的随机密码。此账号用于后台登录，与数据库账号分别设置。</p></fieldset>
<button class="submit" type="submit" <?= $missing || $tokenError !== '' ? 'disabled' : '' ?>>完成安装</button>
</form>
<script>document.getElementById('install-form').addEventListener('submit',function(){var button=this.querySelector('button[type="submit"]');button.disabled=true;button.textContent='正在安装，请稍候…';});window.addEventListener('pageshow',function(event){if(event.persisted)window.location.reload();});</script>
<?php endif; ?></body></html>
