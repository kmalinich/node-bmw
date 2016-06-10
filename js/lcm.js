function form_lcm() {
  console.log($('#form-lcm').serialize());
	$.ajax({
		url      : '/lcm',
		type     : 'POST',
		dataType : 'json',
		data     : $('#form-lcm').serialize(), 
		success: function(return_data) {
      console.log(return_data);
		}
	});
}
