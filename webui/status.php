<!DOCTYPE html>
<html lang="en">
	<head>
		<?php include './include/head.php'; ?>
		<?php include './include/css.php'; ?>
	</head>
	<body onload="javascript:vehicle_status();">
		<?php include './include/navbar.php'; ?>
		<div class="container-fluid">

			<button class="btn btn-lg btn-primary btn-block" onclick="javascript:vehicle_status();">Refresh</button>
			<hr>

			<h4><span class="glyphicon glyphicon-dashboard"></span> Engine (running: <span id="engine-running"></span>)</h4>
			<p class="lead">Speed: <span id="engine-speed"></span> RPM</p>
			<hr>

			<h4><span class="glyphicon glyphicons-car"></span> Vehicle</h4>
			<p class="lead">Speed: <span id="vehicle-speed-mph"></span> MPH (<span id="vehicle-speed-kmh"></span> km/h)</p>
			<p class="lead">Handbrake: <span id="vehicle-handbrake"></span></p>
			<p class="lead">Ignition: <span id="vehicle-ignition"></span></p>
			<hr>

			<h4><span class="glyphicon glyphicon-refresh"></span> Temperature</h4>
			<p class="lead">Coolant: <span id="temperature-coolant-c"></span>C (<span id="temperature-coolant-f"></span>F)</p>
			<p class="lead">Exterior: <span id="temperature-exterior-c"></span>C (<span id="temperature-exterior-f"></span>F)</p>
			<hr>

			<h4><span class="glyphicon glyphicon-refresh"></span> OBC</h4>
			<p class="lead">Time: <span id="obc-time"></span></p>
			<p class="lead">Consumption 1: <span id="obc-consumption-1"></span> MPG</p>
			<p class="lead">Consumption 2: <span id="obc-consumption-2"></span> MPG</p>
			<hr>


		</div>
	</body>
	<?php include './include/scripts.php'; ?>
</html>
