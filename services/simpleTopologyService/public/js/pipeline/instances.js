var cached_instances = {};

function createSingleInstanceRow(instance) {
	var props = JSON.parse(instance.properties);
	delete instance.properties;
	instance.props = props;
	if ((instance.status == 'INITIALIZING' && instance.trackingId) || instance.status == 'AVAILABLE') {
		instance.deletable = '';
	} else if (instance.status == 'CHECKED_OUT') {
		instance.deletable = '';
	} else {
		instance.deletable = 'disabled="disabled"';
	}
	cached_instances[instance._id] = instance;
	
	var $item = Mustache.render($('#instanceItemTemplate').html(), instance);
	$('#instance-list > tbody > tr.no-available').hide();
	$('#instance-list > tbody').append($item);
	
	if (instance.status == 'AVAILABLE') {
		$('#checkout-instance-button').removeAttr('disabled');
	}
}
function updateSingleInstanceRow(instance) {
	var props = JSON.parse(instance.properties);
	delete instance.properties;
	instance.props = props;
	if ((instance.status == 'INITIALIZING' && instance.trackingId) || instance.status == 'AVAILABLE') {
		instance.deletable = '';
	} else if (instance.status == 'CHECKED_OUT') {
		instance.deletable = '';
	} else {
		instance.deletable = 'disabled="disabled"';
	}
	cached_instances[instance._id] = instance;
	
	var $item = Mustache.render($('#instanceItemTemplate').html(), instance);
	$('#' + instance._id).replaceWith($item);
	
	if (instance.status == 'AVAILABLE') {
		$('#checkout-instance-button').removeAttr('disabled');
	}
}
function deleteSingleInstanceRow(instanceId) {
	$('#' + instanceId).remove();
	delete cached_instances[instanceId];
	
	var count = $('#instance-list > tbody > tr.data').length;
	if (count == 0) {
		$('#instance-list > tbody > tr.no-available').show();
	}
}

function initCheckoutInstanceModal(poolId) {
	$('#checkout-instance-form').submit(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var form = $(this);
		checkoutInstance(
				$('input#poolId').val(),
				$('textarea#comment').val(),
				function(instance) {
					$('#checkoutInstanceModal').modal('hide');
					updateSingleInstanceRow(instance);
				},
				function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
		);
		return false;
	});
	$('#checkout-instance-form > input#poolId').val(poolId);
	$('#checkoutInstanceModal')
		.on('show.bs.modal', function(e) {
			$('#submit-checkout-instance-form').on('click', function() {
				$('#checkout-instance-form').submit();
			});
		})
		.on('hide.bs.modal', function(e) {
			$('#submit-checkout-instance-form').off('click');
		});
}
function initDeleteInstanceModal() {
	$('#deleteInstanceModal')
		.on('show.bs.modal', function (e) {
			var poolId = $(e.relatedTarget).data('poolid');
			var instanceId = $(e.relatedTarget).data('instanceid');
			var instance = cached_instances[instanceId];
			$('#deleteInstanceBody').html('Are you sure to delete instance "' + instance.name + '"?');
			$('#submit-delete-instance-form').on('click', function() {
				deleteInstance(
						poolId,
						instanceId,
						function() {
							$('#deleteInstanceModal').modal('hide');
							deleteSingleInstanceRow(instanceId);
						},
						function(jqXHR, textStatus, errorThrown) {
							console.log(jqXHR);
							console.log(textStatus);
							console.log(errorThrown);
						}
				);
			});
		})
		.on('hide.bs.modal', function(e) {
			$('#deleteInstanceBody').html('');
			$('#submit-delete-pool-form').off('click');
		});
}

$(document).ready(function() {
	$('#nav-links-pools').toggleClass('active');
	
	Mustache.parse($('#instanceItemTemplate').html());
	
	var pathArray = window.location.pathname.split("/");
	var poolId = pathArray[2];
	
	getPoolById(
			poolId,
			function(pool) {
				if (!pool) {
					return;
				}
				$('.currentPoolName').html(pool.name);
			},
			function(jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
	);
	
	listAllInstances(
			poolId,
			function(instances) {
				if ($.isEmptyObject(instances)) {
					return;
				}
				instances.forEach(createSingleInstanceRow);
			},
			function(jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
	);
	
	initCheckoutInstanceModal(poolId);
	initDeleteInstanceModal();
});
