var cached_pools = {};

function createSinglePoolRow(pool) {
	var props = JSON.parse(pool.properties);
	delete pool.properties;
	pool.props = props;
	cached_pools[pool._id] = pool;
	
	var $item = Mustache.render(pool.type == 'noapp' ? $('#noAppPoolItemTemplate').html(): $('#appPoolItemTemplate').html(), pool);
	$('#pool-list > tbody > tr.no-available').hide();
	$('#pool-list > tbody').append($item);
}
function updateSinglePoolRow(pool) {
	var props = JSON.parse(pool.properties);
	delete pool.properties;
	pool.props = props;
	cached_pools[pool._id] = pool;
	
	var $item = Mustache.render(pool.type == 'noapp' ? $('#noAppPoolItemTemplate').html(): $('#appPoolItemTemplate').html(), pool);
	$('#' + pool._id).replaceWith($item);
}
function deleteSinglePoolRow(poolId) {
	$('#' + poolId).remove();
	delete cached_pools[poolId];
	
	var count = $('#pool-list > tbody > tr.data').length;
	if (count == 0) {
		$('#pool-list > tbody > tr.no-available').show();
	}
}

var cached_providers = {};

function listUCDApplications(provider, onSuccess, onError) {
	$.ajax({
		url: '/rest/ucd/applications',
		type: "GET",
		crossDomain: true,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('UCD_SERVER', provider.server);
			xhr.setRequestHeader('UCD_USERNAME', provider.username);
			xhr.setRequestHeader('UCD_PASSWORD', provider.password);
		},
		success: function(applications) {
			if (onSuccess) {
				return onSuccess($.isEmptyObject(applications) ? [] : applications)
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}

function listUCDBlueprintsByApplication(provider, appName, onSuccess, onError) {
	$.ajax({
		url: '/rest/ucd/applications/' + appName + '/blueprints',
		type: "GET",
		crossDomain: true,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('UCD_SERVER', provider.server);
			xhr.setRequestHeader('UCD_USERNAME', provider.username);
			xhr.setRequestHeader('UCD_PASSWORD', provider.password);
		},
		success: function(blueprints) {
			if (onSuccess) {
				return onSuccess($.isEmptyObject(blueprints) ? [] : blueprints)
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}

function getUCDNodePropertiesByApplicationAndBlueprint(provider, appName, blueprintName, onSuccess, onError) {
	$.ajax({
		url: '/rest/ucd/applications/' + appName + '/blueprints/' + blueprintName,
		type: "GET",
		crossDomain: true,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('UCD_SERVER', provider.server);
			xhr.setRequestHeader('UCD_USERNAME', provider.username);
			xhr.setRequestHeader('UCD_PASSWORD', provider.password);
		},
		success: function(nodeProperties) {
			if (onSuccess) {
				return onSuccess($.isEmptyObject(nodeProperties) ? '' : nodeProperties)
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}

function queryApplications(providerId, defaultApplication) {
	var provider = cached_providers[providerId];
	listUCDApplications(
			provider,
			function(applications) {
				if ($.isEmptyObject(applications)) {
					alert( "Cannot find any applications in specified provider!" );
					return;
				}
				$('select#appName').append('<option value="">Please select a value</option>');
				applications.forEach(function(application) {
					$('select#appName').append('<option value="' + application.name + '">' + application.name + '</option>');
				});
				if (defaultApplication) {
					$('select#appName option[value="' + defaultApplication + '"]').prop('selected', true)
					$('select#appName').change();
				}
			},
			function(jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
	);
}
function queryBlueprints(providerId, appName, defaultBlueprint) {
	var provider = cached_providers[providerId];
	listUCDBlueprintsByApplication(
			provider,
			appName,
			function(json) {
				if ($.isEmptyObject(json)) {
					alert( "Cannot find any blueprints in specified application!" );
					return;
				}
				$('select#blueprintName').append('<option value="">Please select a value</option>');
				json.forEach(function(blueprint) {
					$('select#blueprintName').append('<option value="' + blueprint.name + '">' + blueprint.name + '</option>');
				});
				if (defaultBlueprint) {
					$('select#blueprintName option[value="' + defaultBlueprint + '"]').prop('selected', true)
					$('select#blueprintName').change();
				}
			},
			function(jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
	);
}
function queryNodeProperties(providerId, appName, blueprintName, defaultNodeProperties) {
	var provider = cached_providers[providerId];
	getUCDNodePropertiesByApplicationAndBlueprint(
			provider,
			appName,
			blueprintName,
			function(nodeProperties) {
				if (defaultNodeProperties) {
					$('input#nodeProperties').val(JSON.stringify(defaultNodeProperties, null, 4));
				} else {
					$('input#nodeProperties').val(JSON.stringify(nodeProperties, null, 4));
				}
			},
			function(jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
	);
}

function bindNoAppSelectors(defaultProviderId, defaultApplication, defaultBlueprint, defaultNodeProperties) {
	$('select#providerRef').bind('change', function(event) {
		$('select#appName').empty();
		$('select#blueprintName').empty();
		$('input#nodeProperties').val('');
		queryApplications($('select#providerRef').val(), defaultApplication);
	});
	$('select#appName').bind('change', function(event) {
		$('select#blueprintName').empty();
		$('input#nodeProperties').val('');
		queryBlueprints($('select#providerRef').val(), $('select#appName').val(), defaultBlueprint);
	});
	$('select#blueprintName').bind('change', function(event) {
		$('input#nodeProperties').val('');
		queryNodeProperties($('select#providerRef').val(), $('select#appName').val(), $('select#blueprintName').val(), defaultNodeProperties);
	});
	
	$('select#providerRef').append('<option value="">Please select a value</option>');
	for (var providerId in cached_providers) {
		var provider = cached_providers[providerId];
		$('select#providerRef').append('<option value="' + provider._id + '">' + provider.type + ' - ' + provider.name + '</option>');
	}
	if (defaultProviderId) {
		$('select#providerRef option[value="' + defaultProviderId + '"]').prop('selected', true)
		$('select#providerRef').change();
	}
}
function unbindNoAppSelectors() {
	$('select#providerRef').off('change');
	$('select#appName').off('change');
	$('select#blueprintName').off('change');
}
function bindAppSelectors(defaultPoolId) {
	$('select#parentPool').bind('change', function(event) {
		var poolId = $(this).val();
		var pool = cached_pools[poolId];
		$('input#poolMaxTotalRange').attr('max', pool.poolMaxTotal);
		$('input#poolMinAvailableRange').attr('max', pool.poolMaxTotal);
		if ($('input#poolMaxTotal').val() > pool.poolMaxTotal) {
			$('input#poolMaxTotalRange').val(pool.poolMaxTotal);
			$('input#poolMaxTotal').val(pool.poolMaxTotal);
		}
		if ($('input#poolMinAvailable').val() > pool.poolMinAvailable) {
			$('input#poolMinAvailableRange').val(pool.poolMinAvailable);
			$('input#poolMinAvailable').val(pool.poolMinAvailable);
		}
	});
	
	$('select#parentPool').append('<option value="">Please select a value</option>');
	for (var poolId in cached_pools) {
		var pool = cached_pools[poolId];
		if (pool.type != 'noapp') {
			continue;
		}
		$('select#parentPool').append('<option value="' + pool._id + '">' + pool.name + '</option>');
	}
	if (defaultPoolId) {
		$('select#parentPool option[value="' + defaultPoolId + '"]').prop('selected', true)
		$('select#parentPool').change();
	}
}
function unbindAppSelectors() {
	$('select#parentPool').off('change');
}

function initCreateNoAppPoolModal() {
	$('#create-noapppool-form').submit(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var form = $(this);
		var type = 'noapp';
		var parentPool = { _id: 'NA' };
		var provider = cached_providers[$('select#providerRef').val()];
		var pool = {
				name: $('input#name').val(),
				description: $('input#description').val(),
				type: type,
				parentPool: parentPool._id,
				provider: [provider],
				properties: JSON.stringify({
					appName: $('select#appName').val(),
					blueprintName: $('select#blueprintName').val(),
					nodeProperties: JSON.parse($('input#nodeProperties').val())
				}),
				poolMaxTotal: $('input#poolMaxTotal').val(),
				poolMinAvailable: $('input#poolMinAvailable').val()
			};
		createPool(
				pool,
				function(pool) {
					$('#createNoAppPoolModal').modal('hide');
					createSinglePoolRow(pool);
				},
				function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
		);
		return false;
	});
	$('#createNoAppPoolModal')
		.on('show.bs.modal', function(e) {
			$('#create-noapppool-form').html(Mustache.render($('#noAppPoolFormTemplate').html(), {poolMaxTotal: 5, poolMinAvailable: 1}));
			bindNoAppSelectors(null, null, null, null);
			$('input#poolMaxTotalRange').bind('change', function(event) {
				var value = $(this).val();
				$('input#poolMaxTotal').val(value);
				$('input#poolMinAvailableRange').attr('max', value);
			});
			$('input#poolMinAvailableRange').bind('change', function(event) {
				var value = $(this).val();
				$('input#poolMinAvailable').val(value);
			});
			$('#submit-create-noapppool-form').on('click', function() {
				$('#create-noapppool-form').submit();
			});
		})
		.on('hide.bs.modal', function(e) {
			$('input#poolMaxTotalRange').off('change');
			$('input#poolMinAvailableRange').off('change');
			unbindNoAppSelectors();
			$('#create-noapppool-form').html('');
			$('#submit-create-noapppool-form').off('click');
		});
}
function initCreateAppPoolModal() {
	$('#create-apppool-form').submit(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var form = $(this);
		var type = 'app';
		var parentPool = cached_pools[$('select#parentPool').val()];
		var provider = parentPool.provider[0];
		var pool = {
				name: $('input#name').val(),
				description: $('input#description').val(),
				type: type,
				parentPool: parentPool._id,
				provider: [provider],
				properties: JSON.stringify({
					appName: parentPool.props.appName,
					appProcessName: $('input#appProcessName').val(),
					processProperties: JSON.parse($('textarea#processProperties').val()),
					snapshotName: $('input#snapshotName').val()
				}),
				poolMaxTotal: $('input#poolMaxTotal').val(),
				poolMinAvailable: $('input#poolMinAvailable').val()
			};
		createPool(
				pool,
				function(pool) {
					$('#createAppPoolModal').modal('hide');
					createSinglePoolRow(pool);
				},
				function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
		);
		return false;
	});
	$('#createAppPoolModal')
		.on('show.bs.modal', function(e) {
			$('#create-apppool-form').html(Mustache.render($('#appPoolFormTemplate').html(), {processProperties: '{}', poolMaxTotal: 5, poolMinAvailable: 1}));
			bindAppSelectors(null);
			$('#poolMaxTotalRange').bind('change', function(event) {
				var value = $(this).val();
				$('#poolMaxTotal').val(value);
				$('#poolMinAvailableRange').attr('max', value);
			});
			$('#poolMinAvailableRange').bind('change', function(event) {
				var value = $(this).val();
				$('#poolMinAvailable').val(value);
			});
			$('#submit-create-apppool-form').on('click', function() {
				$('#create-apppool-form').submit();
			});
		})
		.on('hide.bs.modal', function(e) {
			$('#poolMaxTotalRange').off('change');
			$('#poolMinAvailableRange').off('change');
			unbindAppSelectors();
			$('#create-apppool-form').html('');
			$('#submit-create-apppool-form').off('click');
		});
}
function initEditNoAppPoolModal() {
	$('#edit-noapppool-form').submit(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var form = $(this);
		var type = 'noapp';
		var parentPool = 'NA';
		var provider = cached_providers[$('select#providerRef').val()];
		var pool = {
				_id: $('input#_id').val(),
				name: $('input#name').val(),
				description: $('input#description').val(),
				type: type,
				parentPool: parentPool,
				provider: [provider],
				properties: JSON.stringify({
					appName: $('select#appName').val(),
					blueprintName: $('select#blueprintName').val(),
					nodeProperties: JSON.parse($('input#nodeProperties').val())
				}),
				poolMaxTotal: $('input#poolMaxTotal').val(),
				poolMinAvailable: $('input#poolMinAvailable').val()
			};
		updatePool(
				pool,
				function(updatedPool) {
					$('#editNoAppPoolModal').modal('hide');
					updateSinglePoolRow(updatedPool);
				},
				function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
		);
		return false;
	});
	$('#editNoAppPoolModal')
		.on('show.bs.modal', function (e) {
			var poolId = $(e.relatedTarget).data('poolid');
			var pool = cached_pools[poolId];
			$('#edit-noapppool-form').html(Mustache.render($('#noAppPoolFormTemplate').html(), pool));
			
			$('input#name').attr('readonly', true);
			
			var provider = cached_providers[pool.provider[0]._id];
			$('select#providerRef').append('<option value="' + provider._id + '">' + provider.type + ' - ' + provider.name + '</option>');
			$('select#providerRef').attr('readonly', true);
			
			var appName = pool.props.appName;
			var blueprintName = pool.props.blueprintName;
			var nodeProperties = pool.props.nodeProperties;
			
			$('select#appName').append('<option value="' + appName + '">' + appName + '</option>');
			$('select#appName').attr('readonly', true);
			$('select#blueprintName').append('<option value="' + blueprintName + '">' + blueprintName + '</option>');
			$('select#blueprintName').attr('readonly', true);
			$('input#nodeProperties').val(JSON.stringify(nodeProperties, null, 4));
			$('input#nodeProperties').attr('readonly', true);
			
			$('#poolMaxTotalRange').bind('change', function(event) {
				var value = $(this).val();
				$('#poolMaxTotal').val(value);
				$('#poolMinAvailableRange').attr('max', value);
			});
			$('#poolMinAvailableRange').bind('change', function(event) {
				var value = $(this).val();
				$('#poolMinAvailable').val(value);
			});
			$('#submit-edit-noapppool-form').on('click', function() {
				$('#edit-noapppool-form').submit();
			});
		})
		.on('hide.bs.modal', function(e) {
			$('#poolMaxTotalRange').off('change');
			$('#poolMinAvailableRange').off('change');
			$('#edit-noapppool-form').html('');
			$('#submit-edit-noapppool-form').off('click');
		});
}
function initEditAppPoolModal() {
	$('#edit-apppool-form').submit(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var form = $(this);
		var type = 'app';
		var parentPool = cached_pools[$('select#parentPool').val()];
		var provider = parentPool.provider[0];
		var pool = {
				_id: $('input#_id').val(),
				name: $('input#name').val(),
				description: $('input#description').val(),
				type: type,
				parentPool: parentPool._id,
				provider: [provider],
				properties: JSON.stringify({
					appName: parentPool.props.appName,
					appProcessName: $('input#appProcessName').val(),
					processProperties: JSON.parse($('textarea#processProperties').val()),
					snapshotName: $('input#snapshotName').val()
				}),
				poolMaxTotal: $('input#poolMaxTotal').val(),
				poolMinAvailable: $('input#poolMinAvailable').val()
			};
		updatePool(
				pool,
				function(updatedPool) {
					$('#editAppPoolModal').modal('hide');
					updateSinglePoolRow(updatedPool);
				},
				function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
		);
		return false;
	});
	$('#editAppPoolModal')
		.on('show.bs.modal', function (e) {
			var poolId = $(e.relatedTarget).data('poolid');
			var pool = cached_pools[poolId];
			$('#edit-apppool-form').html(Mustache.render($('#appPoolFormTemplate').html(), pool));
			
			$('input#name').attr('readonly', true);
			
			var parentPool = cached_pools[pool.parentPool];
			$('select#parentPool').append('<option value="' + parentPool._id + '">' + parentPool.name + '</option>');
			$('select#parentPool').attr('readonly', true);
			
			console.log(pool);
			var processProperties = JSON.parse(pool.props.processProperties);
			
			$('input#appProcessName').attr('readonly', true);
			$('textarea#processProperties').val(JSON.stringify(processProperties, null, 4));
			$('input#snapshotName').attr('readonly', true);
			
			$('#poolMaxTotalRange').bind('change', function(event) {
				var value = $(this).val();
				$('#poolMaxTotal').val(value);
				$('#poolMinAvailableRange').attr('max', value);
			});
			$('#poolMinAvailableRange').bind('change', function(event) {
				var value = $(this).val();
				$('#poolMinAvailable').val(value);
			});
			$('#submit-edit-apppool-form').on('click', function() {
				$('#edit-apppool-form').submit();
			});
		})
		.on('hide.bs.modal', function(e) {
			$('#poolMaxTotalRange').off('change');
			$('#poolMinAvailableRange').off('change');
			$('#edit-apppool-form').html('');
			$('#submit-edit-apppool-form').off('click');
		});
}
function initDeletePoolModal() {
	$('#deletePoolModal')
		.on('show.bs.modal', function (e) {
			var poolId = $(e.relatedTarget).data('poolid');
			var pool = cached_pools[poolId];
			$('#deletePoolBody').html('Are you sure to delete pool "' + pool.name + '"?');
			$('#submit-delete-pool-form').on('click', function() {
				deletePool(
						poolId,
						function() {
							$('#deletePoolModal').modal('hide');
							deleteSinglePoolRow(poolId);
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
			$('#deletePoolBody').html('');
			$('#submit-delete-pool-form').off('click');
		});
}

$(document).ready(function() {
	$('#nav-links-pools').toggleClass('active');
	
	Mustache.parse($('#noAppPoolItemTemplate').html());
	Mustache.parse($('#appPoolItemTemplate').html());
	Mustache.parse($('#noAppPoolFormTemplate').html());
	Mustache.parse($('#appPoolItemTemplate').html());
	
	listAllPools(
			function(pools) {
				if ($.isEmptyObject(pools)) {
					return;
				}
				pools.forEach(createSinglePoolRow);
			},
			function(jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
	);
	
	listAllProviders(
			function(providers) {
				if ($.isEmptyObject(providers)) {
					alert( "please define the topology providers first!" );
					return;
				}
				providers.forEach(function(provider) {
					cached_providers[provider._id] = provider;
				});
			},
			function(xhr, status, errorThrown) {
				alert( "Sorry, there was a problem to get providers!" );
				console.log( "Error: " + errorThrown );
				console.log( "Status: " + status );
			}
	);
	
	initCreateNoAppPoolModal();
	initCreateAppPoolModal();
	initEditNoAppPoolModal();
	initEditAppPoolModal();
	initDeletePoolModal();
	
});
