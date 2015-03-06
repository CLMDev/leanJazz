function createSingleProviderRow(provider) {
	var $item = Mustache.render($('#providerItemTemplate').html(), provider);
	$('#provider-list > tbody > tr.no-available').hide();
	$('#provider-list > tbody').append($item);
}
function updateSingleProviderRow(provider) {
	var $item = Mustache.render($('#providerItemTemplate').html(), provider);
	$('#' + provider._id).replaceWith($item);
}
function deleteSingleProviderRow(providerId) {
	$('#' + providerId).remove();
	var count = $('#provider-list > tbody > tr.data').length;
	if (count == 0) {
		$('#provider-list > tbody > tr.no-available').show();
	}
}

function initCreateProviderModal() {
	$('#create-provider-form').submit(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var form = $(this);
		var provider = {
				name: $('#name').val(),
				description: $('#description').val(),
				type: $('#type').val(),
				server: $('#server').val(),
				username: $('#username').val(),
				password: $('#password').val()
			};
		createProvider(
				provider,
				function(provider) {
					$('#createProviderModal').modal('hide');
					createSingleProviderRow(provider);
				},
				function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
		);
		return false;
	});
	$('#createProviderModal')
		.on('show.bs.modal', function(e) {
			$('#create-provider-form').html(Mustache.render($('#providerFormTemplate').html(), {}));
			$('#submit-create-provider-form').on('click', function() {
				$('#create-provider-form').submit();
			});
		})
		.on('hide.bs.modal', function(e) {
			$('#create-provider-form').html('');
			$('#submit-create-provider-form').off('click');
		});
}
function initEditProviderModal() {
	$('#edit-provider-form').submit(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var form = $(this);
		var provider = {
				_id: $('#_id').val(),
				name: $('#name').val(),
				description: $('#description').val(),
				type: $('#type').val(),
				server: $('#server').val(),
				username: $('#username').val(),
				password: $('#password').val()
			};
		updateProvider(
				provider,
				function(provider) {
					$('#editProviderModal').modal('hide');
					updateSingleProviderRow(provider);
				},
				function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
		);
		return false;
	});
	$('#editProviderModal')
		.on('show.bs.modal', function (e) {
			var providerId = $(e.relatedTarget).data('providerid');
			getProviderById(
					providerId,
					function(provider) {
						$('#edit-provider-form').html(Mustache.render($('#providerFormTemplate').html(), provider));
						$('#submit-edit-provider-form').on('click', function() {
							$('#edit-provider-form').submit();
						});
					},
					function(jqXHR, textStatus, errorThrown) {
						console.log(jqXHR);
						console.log(textStatus);
						console.log(errorThrown);
					}
			);
		})
		.on('hide.bs.modal', function(e) {
			$('#edit-provider-form').html('');
			$('#submit-edit-provider-form').off('click');
		});
}
function initDeleteProviderModal() {
	$('#deleteProviderModal')
		.on('show.bs.modal', function (e) {
			var providerId = $(e.relatedTarget).data('providerid');
			getProviderById(
					providerId,
					function(provider) {
						$('#deleteProviderBody').html('Are you sure to delete provider "' + provider.name + '"?');
						$('#submit-delete-provider-form').on('click', function() {
							deleteProvider(
									providerId,
									function() {
										$('#deleteProviderModal').modal('hide');
										deleteSingleProviderRow(providerId);
									},
									function(jqXHR, textStatus, errorThrown) {
										console.log(jqXHR);
										console.log(textStatus);
										console.log(errorThrown);
									}
							);
						});
					},
					function(jqXHR, textStatus, errorThrown) {
						console.log(jqXHR);
						console.log(textStatus);
						console.log(errorThrown);
					}
			);
		})
		.on('hide.bs.modal', function(e) {
			$('#deleteProviderBody').html('');
			$('#submit-delete-provider-form').off('click');
		});
}

$(document).ready(function() {
	$('#nav-links-settings').toggleClass('active');
	
	Mustache.parse($('#providerItemTemplate').html());
	Mustache.parse($('#providerFormTemplate').html());
	
	listAllProviders(
			function(providers) {
				if ($.isEmptyObject(providers)) {
					return;
				}
				$('#provider-list > tbody').html('');
				providers.forEach(createSingleProviderRow);
			},
			function(jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
	);
	
	initCreateProviderModal();
	initEditProviderModal();
	initDeleteProviderModal();
	
});
