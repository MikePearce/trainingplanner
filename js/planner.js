
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
			
			// Timey-wimey stuff
			if (typeof startTime === 'undefined') {
				date = new Date();
				date.setHours($('#start-time').val());
				date.setMinutes(00);
				date.setSeconds(00);

				startTime = date
				endTime = dateAdd(date, 'minute', value.mins);	
			}
			else {
				startTime = endTime
				endTime = dateAdd(endTime, 'minute', value.mins);	
				

			}

			startClock = startTime.getHours()+":"+(startTime.getMinutes()<10?'0':'') + startTime.getMinutes();
			endClock = endTime.getHours()+":"+(endTime.getMinutes()<10?'0':'') + endTime.getMinutes();
			

			$('#sort > tbody:last-child').append(
				'<tr data-id="'+value.order+'" data-order="'+value.order+'"><td class="drag"><span class="glyphicon glyphicon-resize-vertical"></span></td>'
				//+'<td id="edit-name-'+value.order+'" data-key="'+value.order+'" data-what="order">'+ value.order +'</td>'
				+'<td class="edit edit-name" id="edit-name-'+value.order+'" data-key="'+value.order+'" data-what="name">'+ value.name +'</td>'
				+'<td class="edit edit-description" id="edit-description-'+value.order+'" data-key="'+value.order+'" data-what="description">'+ value.description +'</td>'
				+'<td class="edit edit-mins" id="edit-mins-'+value.order+'" data-key="'+value.order+'" data-what="mins">'+ value.mins +'</td>'
				+'<td>'+ startClock +' > '+ endClock +'</td>'
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
			'<tr data-id="'+x+'" data-order="'+x+'"><td class="drag"><span class="glyphicon glyphicon-resize-vertical"></span></td>'
			//+'<td id="edit-name-'+x+'" data-key="'+x+'" data-what="order">'+ x +'</td>'
			+'<td class="edit edit-name" id="edit-name-'+x+'" data-key="'+x+'" data-what="name">Name of session</td>'
			+'<td class="edit edit-description" id="edit-description-'+x+'" data-key="'+x+'" data-what="description">Description of session</td>'
			+'<td class="edit edit-mins" id="edit-mins-'+x+'" data-key="'+x+'" data-what="mins">30</td>'
			+'<td></td>'
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
	// Return a helper with preserved width of cells
	var fixHelper = function(e, ui) {
		ui.children().each(function() {
			$(this).width($(this).width());
		});
		return ui;
	};

	$("#sort tbody").sortable({
		helper: fixHelper,
	    axis: 'y',
	    update: function (event, ui) {
	    	
	    	// Empty the plan 
	    	var newPlan = [];
	        var rows = $(this).children('tr');
	        $.each(rows, function(key, value) {

	        	// Now we need to rebuild the plan object
				newPlan.push( { 
					'order': $(this).data('order'), 
					'name' : $(this).children('.edit-name').text(), 
					'description' : $(this).children('.edit-description').text(), 
					'mins' : $(this).children('.edit-mins').text() 
				} );
	        });

	        // Now, overwrite the plan in localStorage
	        localStorage.setItem('plan', JSON.stringify(newPlan));
	    }
	}).disableSelection();

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

	}

	/**
	DATE STUFF
	**/
	function dateAdd(date, interval, units) {
		var ret = new Date(date); //don't change original date
		switch(interval.toLowerCase()) {
			case 'year'   :  ret.setFullYear(ret.getFullYear() + units);  break;
			case 'quarter':  ret.setMonth(ret.getMonth() + 3*units);  break;
			case 'month'  :  ret.setMonth(ret.getMonth() + units);  break;
			case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
			case 'day'    :  ret.setDate(ret.getDate() + units);  break;
			case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
			case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
			case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
			default       :  ret = undefined;  break;
		}
		return ret;
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