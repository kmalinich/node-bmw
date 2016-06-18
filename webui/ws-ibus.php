<!DOCTYPE html>
<html lang="en">
	<head>
		<?php include './include/head.php'; ?>
		<?php include './include/css.php'; ?>
	</head>
	<body onload="javascript:ws_ibus();">
		<?php include './include/navbar.php'; ?>
		<div class="container-fluid">
			<h3>IBUS websocket.</h3>
			<hr>
			<div class="well">
				<div id="content" class="pre"></div>
			</div>
		</div>
	</body>
	<?php include './include/scripts.php'; ?>
</html>
