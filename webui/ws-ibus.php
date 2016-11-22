<!DOCTYPE html>
<html lang="en">
	<head>
		<?php include './include/head.php'; ?>
		<?php include './include/css.php'; ?>
	</head>
	<body onload="javascript:ws_ibus();">
		<?php include './include/navbar.php'; ?>
		<div class="container-fluid">
			<p id="ws-ibus-header" class="text-warning">Socket connecting</p>
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
					<select class="form-control input-lg" id="ws-ibus-src">
						<option value="0xA4">ABG</option>
						<option value="0x66">AHL</option>
						<option value="0xE7">ANZV</option>
						<option value="0x56">ASC</option>
						<option value="0xCA">ASST</option>
						<option value="0xF0">BMBT</option>
						<option value="0x30">CCM</option>
						<option value="0x18">CDC</option>
						<option value="0x76">CDCD</option>
						<option value="0x46">CID</option>
						<option value="0xF5">CSU</option>
						<option value="0x52">CVM</option>
						<option value="0x3F">DIA</option>
						<option value="0x12">DME</option>
						<option value="0xB8">DME2</option>
						<option value="0x6A">DSP</option>
						<option value="0xEA">DSPC</option>
						<option value="0x32">EGS</option>
						<option value="0xAC">EHC</option>
						<option value="0x02">EKM</option>
						<option value="0x65">EKP</option>
						<option value="0x44">EWS</option>
						<option value="0x40">FBZV</option>
						<option value="0xA7">FHK</option>
						<option value="0xA0">FID</option>
						<option value="0x47">FMBT</option>
						<option value="0xBF">GLO</option>
						<option value="0x00">GM</option>
						<option value="0xA6">GR</option>
						<option value="0x3B">GT</option>
						<option value="0x43">GTF</option>
						<option value="0x9A">HAC</option>
						<option value="0x24">HKM</option>
						<option value="0x5B">IHKA</option>
						<option value="0x80">IKE</option>
						<option value="0xE0">IRIS</option>
						<option value="0xD0">LCM</option>
						<option value="0xFF">LOC</option>
						<option value="0x57">LWS</option>
						<option value="0x50">MFL</option>
						<option value="0xC0">MID</option>
						<option value="0x01">MID1</option>
						<option value="0x9C">MM3</option>
						<option value="0x51">MML</option>
						<option value="0x9B">MMR</option>
						<option value="0xA8">NAVC</option>
						<option value="0x7F">NAVE</option>
						<option value="0xBB">NAVJ</option>
						<option value="0x60">PDC</option>
						<option value="0xF1">PIC</option>
						<option value="0x68">RAD</option>
						<option value="0x28">RCC</option>
						<option value="0x80">RCSC</option>
						<option value="0x70">RDC</option>
						<option value="0xE8">RLS</option>
						<option value="0x73">SDRS</option>
						<option value="0xB0">SES</option>
						<option value="0x08">SHD</option>
						<option value="0x72">SM</option>
						<option value="0xDA">SMAD</option>
						<option value="0x74">SOR</option>
						<option value="0x6B">STH</option>
						<option value="0xCA">TCU</option>
						<option value="0xC8">TEL</option>
						<option value="0xED">VID</option>
					</select>
				</div>	
				<div class="col-lg-3 col-sm-6 col-xs-12">
					<select class="form-control input-lg" id="ws-ibus-dst">
						<option value="0xA4">ABG</option>
						<option value="0x66">AHL</option>
						<option value="0xE7">ANZV</option>
						<option value="0x56">ASC</option>
						<option value="0xCA">ASST</option>
						<option value="0xF0">BMBT</option>
						<option value="0x30">CCM</option>
						<option value="0x18">CDC</option>
						<option value="0x76">CDCD</option>
						<option value="0x46">CID</option>
						<option value="0xF5">CSU</option>
						<option value="0x52">CVM</option>
						<option value="0x3F">DIA</option>
						<option value="0x12">DME</option>
						<option value="0xB8">DME2</option>
						<option value="0x6A">DSP</option>
						<option value="0xEA">DSPC</option>
						<option value="0x32">EGS</option>
						<option value="0xAC">EHC</option>
						<option value="0x02">EKM</option>
						<option value="0x65">EKP</option>
						<option value="0x44">EWS</option>
						<option value="0x40">FBZV</option>
						<option value="0xA7">FHK</option>
						<option value="0xA0">FID</option>
						<option value="0x47">FMBT</option>
						<option value="0xBF">GLO</option>
						<option value="0x00">GM</option>
						<option value="0xA6">GR</option>
						<option value="0x3B">GT</option>
						<option value="0x43">GTF</option>
						<option value="0x9A">HAC</option>
						<option value="0x24">HKM</option>
						<option value="0x5B">IHKA</option>
						<option value="0x80">IKE</option>
						<option value="0xE0">IRIS</option>
						<option value="0xD0">LCM</option>
						<option value="0xFF">LOC</option>
						<option value="0x57">LWS</option>
						<option value="0x50">MFL</option>
						<option value="0xC0">MID</option>
						<option value="0x01">MID1</option>
						<option value="0x9C">MM3</option>
						<option value="0x51">MML</option>
						<option value="0x9B">MMR</option>
						<option value="0xA8">NAVC</option>
						<option value="0x7F">NAVE</option>
						<option value="0xBB">NAVJ</option>
						<option value="0x60">PDC</option>
						<option value="0xF1">PIC</option>
						<option value="0x68">RAD</option>
						<option value="0x28">RCC</option>
						<option value="0x80">RCSC</option>
						<option value="0x70">RDC</option>
						<option value="0xE8">RLS</option>
						<option value="0x73">SDRS</option>
						<option value="0xB0">SES</option>
						<option value="0x08">SHD</option>
						<option value="0x72">SM</option>
						<option value="0xDA">SMAD</option>
						<option value="0x74">SOR</option>
						<option value="0x6B">STH</option>
						<option value="0xCA">TCU</option>
						<option value="0xC8">TEL</option>
						<option value="0xED">VID</option>
					</select>
				</div>	
				<div class="col-lg-3 col-sm-6 col-xs-12">
					<input type="text" class="form-control input-lg" placeholder="Message, comma separated" id="ws-ibus-msg">
				</div>	
				<div class="col-lg-3 col-sm-6 col-xs-12">
					<button class="btn btn-lg btn-primary btn-block" id="ws-ibus-send">Send</button>
				</div>	
			</div>	
			<hr>
		</div>
	</body>
	<!--
	<script src="/js/socket.io.js"></script>
	-->
	<script src="/socket.io/socket.io.js"></script>
	<script src="/js/moment.js"></script>
	<?php include './include/js.php'; ?>
</html>
