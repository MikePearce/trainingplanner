
$(document).ready(function() {

	alert('moo');
	$("#sort tbody").sortable().disableSelection();

	// Return a helper with preserved width of cells
	var fixHelper = function(e, ui) {
		ui.children().each(function() {
			$(this).width($(this).width());
		});
		return ui;
	};

	$("#sort tbody").sortable({
		helper: fixHelper
	}).disableSelection();
});