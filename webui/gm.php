<!DOCTYPE html>
<html lang="en">
	<head>
		<?php include './include/head.php'; ?>
		<?php include './include/css.php'; ?>
	</head>
	<body onload="javascript:prepare_gm();">
		<?php include './include/navbar.php'; ?>
		<div class="container-fluid">

			<h4>Status</h4>

			<div class="row">
				<div class="col-xs-12">
					<button class="btn btn-lg btn-warning btn-block" id="btn-gm-get-status" onclick="javascript:gm_get();">Get IO status</button>
				</div>
			</div>

			<hr>

			<h4>Central locking</h4>

			<div class="row">
				<div class="col-xs-4">
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-unlock" onclick="javascript:gm_cl('unlock');">Unlock</button>
				</div>
				<div class="col-xs-4">
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-toggle" onclick="javascript:gm_cl('toggle');">Toggle</button>
				</div>
				<div class="col-xs-4">
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_cl('lock');">Lock</button>
				</div>
			</div>

			<hr>

			<h4>Interior lighting brightness</h4>

			<div class="container-fluid">
				<input type="text" id="slider-gm-interior-light" name="gm-interior-light" data-provide="slider" data-slider-min="0" data-slider-max="255" data-slider-tooltip="always" data-slider-tooltip-position="bottom">
			</div>
			<br/>
			<br/>
			<br/>

			<hr>

			<h4>Windows</h4>

			<div class="row">
				<div class="col-xs-6">
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('lf', 'up');">LF up</button>
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('lf', 'dn');">LF down</button>
				</div>
				<div class="col-xs-6">
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('rf', 'up');">RF up</button>
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('rf', 'dn');">RF down</button>
				</div>
			</div>

			<hr>

			<div class="row">
				<div class="col-xs-6">
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('lr', 'up');">LR up</button>
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('lr', 'dn');">LR down</button>
				</div>
				<div class="col-xs-6">
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('rr', 'up');">RR up</button>
					<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('rr', 'dn');">RR down</button>
				</div>
			</div>

			<hr>

			<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('roof', 'up');">Roof up</button>
			<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('roof', 'tt');">Roof tilt</button>
			<button class="btn btn-lg btn-primary btn-block" id="btn-gm-lock" onclick="javascript:gm_windows('roof', 'dn');">Roof down</button>

		</div>
	</body>
	<?php include './include/js.php'; ?>
</html>
