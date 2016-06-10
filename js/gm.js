function form_gm() {
  console.log($('#form-gm').serialize());
	$.ajax({
		url      : '/gm',
		type     : 'POST',
		dataType : 'json',
		data     : $('#form-gm').serialize(), 
		success: function(return_data) {
      console.log(return_data);
		}
	});
}
