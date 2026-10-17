<?php
if (!defined('IN_SYS')) { http_response_code(403); exit('Access denied'); }
?>
<script type="application/json" id="xplayer-bootstrap"><?= Security::json($bootstrap) ?></script>
