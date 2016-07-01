<!DOCTYPE html>
<html lang="en">
	<head>
		<?php include './include/head.php'; ?>
		<?php include './include/css.php'; ?>
	</head>
	<body onload="javascript:prepare_ike();">
		<?php include './include/navbar.php'; ?>
		<div class="container-fluid">

			<h4>OBC Set Clock</h4>
			<form class="form-horizontal" id="form-ike-clock" action="javascript:form_ike_set_clock();">
				<input class="form-control" type="text" name="obc-clock-day" id="form-ike-clock-day" placeholder="Day">
				<br/>
				<input class="form-control" type="text" name="obc-clock-month" id="form-ike-clock-month" placeholder="Month">
				<br/>
				<input class="form-control" type="text" name="obc-clock-year" id="form-ike-clock-year" placeholder="Year">
				<br/>
				<input class="form-control" type="text" name="obc-clock-hour" id="form-ike-clock-hour" placeholder="Hour">
				<br/>
				<input class="form-control" type="text" name="obc-clock-minute" id="form-ike-clock-minute" placeholder="Minute">
				<br/>

				<br/>
				<div class="row">
					<div class="col-xs-6">
						<button class="btn btn-lg btn-danger btn-block" id="form-ike-get-reset" type="reset">Reset</button>
					</div>
					<div class="col-xs-6">
						<button class="btn btn-lg btn-primary btn-block" id="form-ike-get-submit" type="submit">Send</button>
					</div>
				</div>
			</form>
			<hr>

			<h4>OBC Get</h4>
			<form class="form-horizontal" id="form-ike-get" action="javascript:form_ike_get();">

				<div class="radio">
					<label>
						<input type="radio" name="obc-get" id="form-ike-get-all" value="all" checked>
						All
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-get" id="form-ike-get-time" value="time">
						Time
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-get" id="form-ike-get-date" value="date">
						Date
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-get" id="form-ike-get-cons1" value="cons1">
						Consumption 1
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-get" id="form-ike-get-cons2" value="cons2">
						Consumption 2
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-get" id="form-ike-get-speedavg" value="speedavg">
						Speed average
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-get" id="form-ike-get-speedlimit" value="speedlimit">
						Current speed limit
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-get" id="form-ike-get-distance" value="distance">
						Distance
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-get" id="form-ike-get-distance" value="range">
						Range
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-get" id="form-ike-get-distance" value="temp_exterior">
						Exterior temp
					</label>
				</div>

				<br/>
				<div class="row">
					<div class="col-xs-6">
						<button class="btn btn-lg btn-danger btn-block" id="form-ike-get-reset" type="reset">Reset</button>
					</div>
					<div class="col-xs-6">
						<button class="btn btn-lg btn-primary btn-block" id="form-ike-get-submit" type="submit">Send</button>
					</div>
				</div>

			</form>
			<hr>

			<h4>OBC Reset</h4>
			<form class="form-horizontal" id="form-ike-reset" action="javascript:form_ike_reset();">

				<div class="radio">
					<label>
						<input type="radio" name="obc-reset" id="form-ike-reset-cons1" value="cons1">
						Consumption 1
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-reset" id="form-ike-reset-cons2" value="cons2">
						Consumption 2
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-reset" id="form-ike-reset-speedavg" value="speedavg">
						Speed average
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-reset" id="form-ike-reset-distance" value="distance">
						Distance
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-reset" id="form-ike-reset-speedlimit" value="speedlimiton">
						Speed limit on
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-reset" id="form-ike-reset-speedlimit" value="speedlimitoff">
						Speed limit off
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-reset" id="form-ike-reset-speedlimit" value="speedlimit">
						Current speed limit
					</label>
				</div>

				<br/>
				<div class="row">
					<div class="col-xs-6">
						<button class="btn btn-lg btn-danger btn-block" id="form-ike-reset-reset" type="reset">Reset</button>
					</div>
					<div class="col-xs-6">
						<button class="btn btn-lg btn-primary btn-block" id="form-ike-reset-submit" type="submit">Send</button>
					</div>
				</div>

			</form>
			<hr>


			<h4>Gong</h4>
			<form class="form-horizontal" id="form-ike-gong" action="javascript:form_ike_gong();">

				<div class="radio">
					<label>
						<input type="radio" name="obc-gong" id="form-ike-gong-1" value="1">
						Gong 1
					</label>
				</div>

				<div class="radio">
					<label>
						<input type="radio" name="obc-gong" id="form-ike-gong-2" value="2">
						Gong 2
					</label>
				</div>

				<br/>
				<div class="row">
					<div class="col-xs-6">
						<button class="btn btn-lg btn-danger btn-block" id="form-ike-gong-reset" type="reset">Reset</button>
					</div>
					<div class="col-xs-6">
						<button class="btn btn-lg btn-primary btn-block" id="form-ike-gong-submit" type="submit">Send</button>
					</div>
				</div>

			</form>

			<hr>

			<h4>Text</h4>
			<form class="form-horizontal" id="form-ike-text" action="javascript:form_ike_text();">

				<input class="form-control" type="text" name="obc-text" id="form-ike-text-text" placeholder="Cluster text">
				<br/>

				<div class="row">
					<div class="col-xs-6">
						<button class="btn btn-lg btn-danger btn-block" id="form-ike-text-reset" type="reset">Reset</button>
					</div>
					<div class="col-xs-6">
						<button class="btn btn-lg btn-primary btn-block" id="form-ike-text-submit" type="submit">Send</button>
					</div>
				</div>

			</form>

			<hr>

			<h4>Backlight</h4>

			<div class="container-fluid">
				<input type="text" id="slider-ike-backlight" name="ike-backlight" data-provide="slider" data-slider-min="0" data-slider-max="254" data-slider-tooltip="always" data-slider-tooltip-position="bottom">
			</div>
			<br/>
			<br/>
			<br/>

			<hr>

		</div>

	</body>
	<?php include './include/js.php'; ?>
</html>
