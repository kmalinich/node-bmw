<!DOCTYPE html>
<html lang="en">
	<head>
		<?php include './include/head.php'; ?>
		<?php include './include/css.php'; ?>
	</head>
	<body onload="javascript:status_refresh_on();">
		<?php include './include/navbar.php'; ?>
		<div class="container-fluid">

			<h4><i id="icon-refresh" class="fa fa-refresh fa-inverse"></i> Refresh</h4>
			<div class="row">
				<div class="col-xs-6">
					<button class="btn btn-lg btn-warning btn-block" onclick="javascript:status();">Force</button>
				</div>
				<div class="col-xs-6">
					<button id="btn-refresh" class="btn btn-lg btn-success btn-block" onclick="javascript:status_refresh_on();">Enable</button>
				</div>
			</div>
			<hr>

			<div class="row">

				<div class="col-lg-12 col-xs-12">

					<h4><i class="fa fa-car fa-inverse"></i> Vehicle</h4>
					<div class="row text-center">

						<div class="col-xs-6">
							<h6 id="vehicle-ignition" ></h6>
							<h6 id="engine-running"></h5>
							<h6 id="vehicle-handbrake"></h6>
							<h6 id="vehicle-reverse"  ></h6>
						</div>

						<div class="col-xs-6">
							<h6>Speed: <span id="vehicle-speed"></span> <span id="vehicle-speed-unit"></span></h6>
							<h6>Temps: <span id="temperature-coolant"></span>°<span id="temperature-coolant-unit"></span>/<span id="obc-temp-exterior"></span>°<span id="obc-temp-exterior-unit"></span></h6>
							<h6>Odometer: <span id="vehicle-odometer-mi"></span> mi</h6>
							<h6>VIN: <span id="vehicle-vin"></span></h6>
						</div>

					</div>

					<hr>
					<h4><i class="fa fa-key fa-inverse"></i> <span id="vehicle-locked"></span>, <span id="lights-interior"></span></h4>
					<hr>

					<div class="row text-center">

						<div class="col-xs-12">
							<div class="row">
								<h6 id="flaps-hood"></h6>
							</div>
							<hr>
						</div>

						<div class="col-xs-12">
							<div class="row">
								<div class="col-xs-6">
									<h6 id="flaps-front-left" ></h6>
									<h6 id="windows-front-left" ></h6>
								</div>
								<div class="col-xs-6">
									<h6 id="flaps-front-right"></h6>
									<h6 id="windows-front-right"></h6>
								</div>
							</div>
							<hr>
						</div>

						<div class="col-xs-12">
							<div class="row">
								<h6 id="windows-roof"></h6>
							</div>
							<hr>
						</div>

						<div class="col-xs-12">
							<div class="row">
								<div class="col-xs-6">
									<h6 id="flaps-rear-left" ></h6>
									<h6 id="windows-rear-left" ></h6>
								</div>
								<div class="col-xs-6">
									<h6 id="flaps-rear-right"></h6>
									<h6 id="windows-rear-right"></h6>
								</div>
							</div>
							<hr>
						</div>

						<div class="col-xs-12">
							<h6 id="flaps-trunk"></h6>
						</div>

					</div>

				</div>

			</div>

			<hr>

			<div class="row">

				<div class="col-lg-12 col-xs-12">
					<h4><i class="fa fa-desktop fa-inverse"></i> OBC</h4>

					<div class="row text-center">

						<div class="col-xs-6">
							<h5>Average speed</h5>
							<h6><span id="obc-speedavg"></span> <span id="obc-speedavg-unit"></span></h6>
						</div>
						<div class="col-xs-6">
							<h5>Range</h5>
							<h6><span id="obc-range"></span> <span id="obc-range-unit"></span></h6>
						</div>
					</div>

					<hr>

					<div class="row text-center">
						<div class="col-xs-6">
							<h5>MPG 1</h5>
							<h6><span id="obc-consumption-1"></span> <span id="obc-consumption-1-unit"></span></h6>
						</div>
						<div class="col-xs-6">
							<h5>MPG 2</h5>
							<h6><span id="obc-consumption-2"></span> <span id="obc-consumption-2-unit"></span></h6>
						</div>
					</div>

					<hr>

				</div>

			</div>

		</div>
	</body>
	<?php include './include/js.php'; ?>
</html>
