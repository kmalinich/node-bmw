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

			<div class="container">
				<input type="text" id="slider-gm-interior-light" name="gm-interior-light" data-provide="slider" data-slider-min="0" data-slider-max="254" data-slider-tooltip="always" data-slider-tooltip-position="bottom">
			</div>
			<br/>
			<br/>
			<br/>

		</div>
	</body>
	<?php include './include/js.php'; ?>
</html>
