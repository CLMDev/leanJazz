function listAllProviders(onSuccess, onError) {
	$.ajax({
		type: 'GET',
		url: '/api4gui/v1/providers',
		success: function(providers) {
			if (onSuccess) {
				return onSuccess($.isEmptyObject(providers) ? [] : providers);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
function createProvider(provider, onSuccess, onError) {
	$.ajax({
		type: 'POST',
		url: '/api4gui/v1/providers',
		data: provider,
		success: function(provider) {
			if (onSuccess) {
				return onSuccess(provider);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
function getProviderById(providerId, onSuccess, onError) {
	$.ajax({
		url: '/api4gui/v1/providers/' + providerId + '/',
		type: "GET",
		success: function(provider) {
			if (onSuccess) {
				return onSuccess(provider);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
function updateProvider(provider, onSuccess, onError) {
	$.ajax({
		type: 'PUT',
		url: '/api4gui/v1/providers/' + provider._id,
		data: provider,
		success: function(provider) {
			if (onSuccess) {
				return onSuccess(provider);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
function deleteProvider(providerId, onSuccess, onError) {
	$.ajax({
		type: 'DELETE',
		url: '/api4gui/v1/providers/' + providerId,
		success: function() {
			if (onSuccess) {
				return onSuccess();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}

function listAllPools(onSuccess, onError) {
	$.ajax({
		type: 'GET',
		url: '/api4gui/v1/topology/pools',
		success: function(pools) {
			if (onSuccess) {
				return onSuccess($.isEmptyObject(pools) ? [] : pools);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
function createPool(pool, onSuccess, onError) {
	$.ajax({
		type: 'POST',
		url: '/api4gui/v1/topology/pools',
		data: pool,
		success: function(pool) {
			if (onSuccess) {
				return onSuccess(pool);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
function getPoolById(poolId, onSuccess, onError) {
	$.ajax({
		method: 'GET',
		url: '/api4gui/v1/topology/pools/' + poolId,
		success: function(pool) {
			if (onSuccess) {
				return onSuccess(pool);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
function updatePool(pool, onSuccess, onError) {
	$.ajax({
		type: 'PUT',
		url: '/api4gui/v1/topology/pools/' + pool._id,
		data: pool,
		success: function(doc) {
			if (onSuccess) {
				return onSuccess(doc)
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
function deletePool(poolId, onSuccess, onError) {
	$.ajax({
		type: 'DELETE',
		url: '/api4gui/v1/topology/pools/' + poolId,
		success: function() {
			if (onSuccess) {
				return onSuccess()
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}

function listAllInstances(poolId, onSuccess, onError) {
	$.ajax({
		type: 'GET',
		url: '/api4gui/v1/topology/pools/' + poolId + '/instances',
		success: function(instances) {
			if (onSuccess) {
				return onSuccess($.isEmptyObject(instances) ? [] : instances);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
function checkoutInstance(poolId, comment, onSuccess, onError) {
	$.ajax({
		type: 'POST',
		url: '/api4gui/v1/topology/pools/' + poolId + '/actions',
		data: {
			type: 'checkout',
			comment: comment
		},
		success: function(instance) {
			if (onSuccess) {
				return onSuccess(instance);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
function deleteInstance(poolId, instanceId, onSuccess, onError) {
	$.ajax({
		type: 'DELETE',
		url: '/api4gui/v1/topology/pools/' + poolId + '/instances/' + instanceId,
		success: function() {
			if (onSuccess) {
				return onSuccess();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (onError) {
				return onError(jqXHR, textStatus, errorThrown);
			}
		}
	});
}
