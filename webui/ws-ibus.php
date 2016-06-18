<!DOCTYPE html>
<html lang="en">
	<head>
		<?php include './include/head.php'; ?>
		<?php include './include/css.php'; ?>
	</head>
	<body onload="javascript:ws_ibus();">
		<?php include './include/navbar.php'; ?>
		<div class="container-fluid">
			<p id="ws-ibus-header" class="text-warning">Live IBUS. Connecting...</p>
			<hr>
				<div id="content" class="pre"></div>
				<div class="table-responsive">
					<table class="table table-condensed table-hover table-bordered table-striped text-center" id="ws-ibus-table">
						<thead>
							<tr>
								<th class="text-center">time</th>
								<th class="text-center">srce</th>
								<th class="text-center">dest</th>
								<th class="text-center">msg</th>
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
				</div>
		</div>
	</body>
	<script src="/js/moment.js"></script>
	<?php include './include/scripts.php'; ?>
</html>
