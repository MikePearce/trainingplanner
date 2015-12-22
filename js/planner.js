
$(document).ready(function() {

	var plan = getPlan();

	editOpts = {
		url: function(value, settings) {
			saveModification(this.dataset.key, value, this.dataset.what);
			return(value);
		},
		opts: {
			indicator : 'Saving...',
        	tooltip   : 'Click to edit...'	,
        	onblur	  : 'submit'
		}
	};	


	function getPlan() {
		if(localStorage.getItem('plan')) {
			plan = JSON.parse(localStorage.getItem('plan'));
		} else {
			plan = [
				{ 'order': 1, 'name' : 'Name of session', 'description' : 'description of session', 'mins' : '30' }, 
			];
			localStorage.setItem('plan', JSON.stringify(plan));
		}

		// Remove nulls
		plan = plan.filter(function(n){ return n != undefined }); 
		return plan;
	}

	// Do we ahve anything in local storage?
	$.each(plan, function(key, value) {
		if ( value !== null ) {
			$('#sort > tbody:last-child').append(
				'<tr id="id'+value.order+'" data-order="'+value.order+'"><td class="drag">O</td>'
				+'<td id="edit-name-'+value.order+'" data-key="'+value.order+'" data-what="order">'+ value.order +'</td>'
				+'<td class="edit" id="edit-name-'+value.order+'" data-key="'+value.order+'" data-what="name">'+ value.name +'</td>'
				+'<td class="edit" id="edit-description-'+value.order+'" data-key="'+value.order+'" data-what="description">'+ value.description +'</td>'
				+'<td class="edit" id="edit-mins-'+value.order+'" data-key="'+value.order+'" data-what="mins">'+ value.mins +'</td>'
				+'<td><button type="button" class="btn btn-primary delete-session">delete session</button></td></tr>'
			);
		}
		$('.edit').editable(editOpts.url, editOpts.opts);
		//console.log(key +": "+ value.name);
	});

	/**
	ADD new row
	**/
	$('#add-session').click(function(){

		// find the last ID
		x = $( "#sort > tbody tr:last-child" ).data( "order" );
		if ( isNaN(x) ) x = 0;
		x = ++x;

        $('#sort > tbody:last-child').append(
			'<tr data-order="'+x+'"><td class="drag">O</td>'
			+'<td id="edit-name-'+x+'" data-key="'+x+'" data-what="order">'+ x +'</td>'
			+'<td class="edit" id="edit-name-'+x+'" data-key="'+x+'" data-what="name">Name of session</td>'
			+'<td class="edit" id="edit-description-'+x+'" data-key="'+x+'" data-what="description">Description of session</td>'
			+'<td class="edit" id="edit-mins-'+x+'" data-key="'+x+'" data-what="mins">30</td>'
			+'<td><button type="button" class="btn btn-primary delete-session">delete session</button></td></tr>'
		);

		$('.edit').editable(editOpts.url, editOpts.opts);
		plan = getPlan();
		plan.push( { 'order': x, 'name' : 'Name of session', 'description' : 'description of session', 'mins' : '30' } );
		localStorage.setItem('plan', JSON.stringify(plan));
    });

    $('#sort').on('click', '.delete-session', function(){

    	// Get the row
    	tr = $(this).closest('tr');

    	plan = getPlan();

    	// Loop through and remove it from the plan
    	$.each(plan, function(i, val) {

    		if (val !== null && val.order == tr.data( 'order' )) {
    			delete plan[i];
    		}
    	});
    	
		localStorage.setItem('plan', JSON.stringify(plan));
		tr.remove();

    });
	

	/**
	DRAGGABLES
	**/
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

	
	/**
	Editables
	**/
	$('.edit').editable(editOpts.url, editOpts.opts);

	function saveModification(key, value, what, order) {

		// Is there a thing in local storage?
		if(localStorage.getItem('plan')) {
			plan = JSON.parse(localStorage.getItem('plan'));
			for (var i=0; i<plan.length; i++) {
			  if (plan[i].order == key) {
			  	switch(what) {
			  		case 'name':
			  			plan[i].name = value;
			  			break;
			  		case 'description':
			  			plan[i].description = value;
			  			break;
			  		case 'mins':
			  			plan[i].mins = value;
			  			break;
			  		case 'order':
			  			plan[i].order = value;
			  			break;
			  		default:
			  			console.log("Trying to update: "+ what);
			  	}
			    break;
			  }
			}

			// Now save it again
			localStorage.setItem('plan', JSON.stringify(plan));
		}

		console.log(key);
		console.log(value);
	}




	/**
	 Filters
	 **/
	 $('.filterable .btn-filter').click(function(){
        var $panel = $(this).parents('.filterable'),
        $filters = $panel.find('.filters input'),
        $tbody = $panel.find('.table tbody');
        if ($filters.prop('disabled') == true) {
            $filters.prop('disabled', false);
            $filters.first().focus();
        } else {
            $filters.val('').prop('disabled', true);
            $tbody.find('.no-result').remove();
            $tbody.find('tr').show();
        }
    });

    $('.filterable .filters input').keyup(function(e){
        /* Ignore tab key */
        var code = e.keyCode || e.which;
        if (code == '9') return;
        /* Useful DOM data and selectors */
        var $input = $(this),
        inputContent = $input.val().toLowerCase(),
        $panel = $input.parents('.filterable'),
        column = $panel.find('.filters th').index($input.parents('th')),
        $table = $panel.find('.table'),
        $rows = $table.find('tbody tr');
        /* Dirtiest filter function ever ;) */
        var $filteredRows = $rows.filter(function(){
            var value = $(this).find('td').eq(column).text().toLowerCase();
            return value.indexOf(inputContent) === -1;
        });
        /* Clean previous no-result if exist */
        $table.find('tbody .no-result').remove();
        /* Show all rows, hide filtered ones (never do that outside of a demo ! xD) */
        $rows.show();
        $filteredRows.hide();
        /* Prepend no-result row if all rows are filtered */
        if ($filteredRows.length === $rows.length) {
            $table.find('tbody').prepend($('<tr class="no-result text-center"><td colspan="'+ $table.find('.filters th').length +'">No result found</td></tr>'));
        }
    });
});