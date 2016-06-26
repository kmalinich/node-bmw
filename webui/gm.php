<!DOCTYPE html>
<html lang="en">
	<head>
		<?php include './include/head.php'; ?>
		<?php include './include/css.php'; ?>
	</head>
	<body>
		<?php include './include/navbar.php'; ?>
		<div class="container-fluid">
			<form class="form-horizontal" id="form-gm" action="javascript:form_gm();">
				<div class="row">
					<div class="col-xs-6">
						<button class="btn btn-lg btn-danger btn-block" id="form-gm-reset" type="reset">Reset</button>
					</div>
					<div class="col-xs-6">
						<button class="btn btn-lg btn-primary btn-block" id="form-gm-submit" type="submit">Send</button>
					</div>
				</div>
				<hr>

				<div class="row">
					<div class="col-xs-6">
						<div class="panel panel-default" id="panel-gm-windows">
							<div class="panel-heading">
								<h4 class="panel-title text-center"><a data-toggle="collapse" href="#collapse-gm-windows">windows</a></h4>
							</div>
							<div id="collapse-gm-windows" class="panel-collapse collapse">
								<div class="panel-body">
									<div class="checkbox">
										<label>
											<input type="checkbox" id="clamp_15" name="clamp_15">
											15
										</label>
									</div>
									<div class="checkbox">
										<label>
											<input type="checkbox" id="clamp_30a" name="clamp_30a">
											30A
										</label>
									</div>
									<div class="checkbox">
										<label>
											<input type="checkbox" id="clamp_30b" name="clamp_30b">
											30B
										</label>
									</div>
									<div class="checkbox">
										<label>
											<input type="checkbox" id="clamp_r" name="clamp_r">
											R
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xs-6">
						<div class="panel panel-default" id="panel-gm-locks">
							<div class="panel-heading">
								<h4 class="panel-title text-center"><a data-toggle="collapse" href="#collapse-gm-locks">locks</a></h4>
							</div>
							<div id="collapse-gm-locks" class="panel-collapse collapse">
								<div class="panel-body">
									<div class="checkbox">
										<label>
											<input type="checkbox" id="clamp_15" name="clamp_15">
											15
										</label>
									</div>
									<div class="checkbox">
										<label>
											<input type="checkbox" id="clamp_30a" name="clamp_30a">
											30A
										</label>
									</div>
									<div class="checkbox">
										<label>
											<input type="checkbox" id="clamp_30b" name="clamp_30b">
											30B
										</label>
									</div>
									<div class="checkbox">
										<label>
											<input type="checkbox" id="clamp_r" name="clamp_r">
											R
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<hr>
				<div class="row">
					<div class="col-xs-6">
						<button class="btn btn-lg btn-danger btn-block" id="form-gm-reset" type="reset">Reset</button>
					</div>
					<div class="col-xs-6">
						<button class="btn btn-lg btn-primary btn-block" id="form-gm-submit" type="submit">Send</button>
					</div>
				</div>
			</form>
		</div>
	</body>
	<?php include './include/scripts.php'; ?>
</html>
