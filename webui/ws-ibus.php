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
			<div class="table-live">
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
			<hr>
			<div class="row">
				<div class="col-lg-3 col-sm-6 col-xs-12">
					<input type="text" class="form-control input-lg" placeholder="Source" id="ws-ibus-src">
				</div>	
				<div class="col-lg-3 col-sm-6 col-xs-12">
					<input type="text" class="form-control input-lg" placeholder="Destination" id="ws-ibus-dst">
				</div>	
				<div class="col-lg-3 col-sm-6 col-xs-12">
					<input type="text" class="form-control input-lg" placeholder="Message" id="ws-ibus-msg">
				</div>	
				<div class="col-lg-3 col-sm-6 col-xs-12">
					<button class="btn btn-lg btn-primary btn-block" id="ws-ibus-send">Send</button>
				</div>	
			</div>	
			<hr>
		</div>
	</body>
	<script src="/js/moment.js"></script>
	<?php include './include/js.php'; ?>
</html>
