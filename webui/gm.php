<!DOCTYPE html>
<html lang="en">
	<head>
		<?php include './include/head.php'; ?>
		<?php include './include/css.php'; ?>
	</head>
	<body onload="javascript:prepare_gm();">
		<?php include './include/navbar.php'; ?>
		<div class="container-fluid">

			<h4>Interior lighting brightness</h4>

			<div class="container-fluid">
				<input type="text" id="slider-gm-interior-light" name="gm-interior-light" data-provide="slider" data-slider-min="0" data-slider-max="255" data-slider-tooltip="never" data-slider-tooltip-position="bottom">
			</div>

			<hr>

			<div class="row">
				<div class="col-xs-12">
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-unlock" onclick="javascript:gm_cl('toggle');"><i class="fa fa-unlock-alt fa-inverse"></i> Central locking</button>
				</div>
			</div>

			<hr>

			<div class="row">
				<div class="col-xs-6">
					<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('lf', 'up');">LF window <i class="fa fa-arrow-up fa-inverse"></i></button>
					<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('lf', 'dn');">LF window <i class="fa fa-arrow-down fa-inverse"></i></button>
				</div>
				<div class="col-xs-6">
					<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('rf', 'up');">RF window <i class="fa fa-arrow-up fa-inverse"></i></button>
					<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('rf', 'dn');">RF window <i class="fa fa-arrow-down fa-inverse"></i></button>
				</div>
			</div>

			<hr>

			<div class="row">
				<div class="col-xs-6">
					<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('lr', 'up');">LR window <i class="fa fa-arrow-up fa-inverse"></i></button>
					<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('lr', 'dn');">LR window <i class="fa fa-arrow-down fa-inverse"></i></button>
				</div>
				<div class="col-xs-6">
					<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('rr', 'up');">RR window <i class="fa fa-arrow-up fa-inverse"></i></button>
					<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('rr', 'dn');">RR window <i class="fa fa-arrow-down fa-inverse"></i></button>
				</div>
			</div>

			<hr>

			<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('roof', 'up');">Roof <i class="fa fa-arrow-up fa-inverse"></i></button>
			<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('roof', 'tt');">Roof <i class="fa fa-bars fa-inverse"></i></button>
			<button class="btn btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('roof', 'dn');">Roof <i class="fa fa-arrow-down fa-inverse"></i></button>

			<!--
			<hr>
			<div class="row">
				<div class="col-xs-12">
					<button class="btn btn-lg btn-warning btn-block" id="btn-gm-get-status" onclick="javascript:gm_get();">Get IO status</button>
				</div>
			</div>
			-->

		</div>
	</body>
	<?php include './include/js.php'; ?>
</html>
