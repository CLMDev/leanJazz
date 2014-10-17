package com.ibm.sts.ucd.utils;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.log4j.Logger;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.ibm.sts.ucd.data.EnvironmentStatus;
import com.ibm.sts.ucd.data.ResourceStatus;
import com.urbancode.ud.client.UDRestClient;

/**
 * This class is used to create and wait for UCD environments. It should be thread safe.
 * 
 * @author nvbak
 */
public class UCDClient extends UDRestClient {

	private static final Logger logger = Logger.getLogger(UCDClient.class.getSimpleName());

	public UCDClient(URI url, String clientUser, String clientPassword) {
		super(url, clientUser, clientPassword);
	}

	public String listApplications() throws IOException {
//		try {
			HttpGet method = new HttpGet(String.format("%s/cli/application", this.url));
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			logger.debug(body);
			return body;
//			JSONArray baseResArray = new JSONArray(body);
//			return baseResArray;
//		} catch (JSONException e) {
//			logger.error("Error when listing applications", e);
//		}
//		return null;
	}

	public String listBlueprintsByApplication(String appName) throws IOException {
//		try {
			HttpGet method = new HttpGet(String.format("%s/cli/application/blueprintsInApplication?application=%s", this.url, URLEncoder.encode(appName, "UTF-8")));
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			logger.debug(body);
			return body;
//			JSONArray baseResArray = new JSONArray(body);
//			return baseResArray;
//		} catch (JSONException e) {
//			logger.error("Error when getting listing", e);
//		}
//		return null;
	}

	public String getBlueprintNodeProperties(String appName, String blueprintName) throws IOException {
		HttpGet method = new HttpGet(String.format("%s/cli/blueprint/getBlueprintNodePropertiesTemplate?application=%s&blueprint=%s", this.url, URLEncoder.encode(appName, "UTF-8"), URLEncoder.encode(blueprintName, "UTF-8")));
		HttpResponse response = invokeMethod(method);
		String body = getBody(response);
		logger.debug(body);
		return body;
	}

	public UUID createEnvironment(URI topoDocURI) throws IOException {
		String topoDoc = new String(Files.readAllBytes(Paths.get(topoDocURI)));

		HttpPut method = new HttpPut(String.format("%s/cli/environment/provisionEnvironment", this.url));
		method.setEntity(new StringEntity(topoDoc));
		HttpResponse response = invokeMethod(method);
		String body = getBody(response);

		UUID result = null;
		try {
			JSONObject jsonBody = new JSONObject(body);
			result = UUID.fromString(jsonBody.getString("id"));
		} catch (JSONException e) {
			logger.error(String.format("Failed to parse environment UUID from result", e));
		}
		return result;
	}

	public EnvironmentStatus getEnvironmentStatus(String appName, String envName) throws IOException {
		EnvironmentStatus envStatus = new EnvironmentStatus();
		Map<String, String> resources = getResourcesStatusByEnv(appName, envName);
		if (resources.isEmpty()) {
			return envStatus;
		}
		int onlineCnt = 0;
		int total = resources.size();
		for (Map.Entry<String, String> res : resources.entrySet()) {
			String name = res.getKey();
			String status = res.getValue();
			logger.debug(String.format("agent: %s, status %s", name, status));
			envStatus.addResourceStatus(new ResourceStatus(name, status));
			if ("ONLINE".equalsIgnoreCase(status)) {
				onlineCnt++;
			}
		}
		logger.info(String.format("%d of %d agent(s) online.", onlineCnt, total));
		if (onlineCnt == total) {
			envStatus.setOnline(true);
		}
		return envStatus;
	}

	private Map<String, String> getResourcesStatusByEnv(String appName, String envName) throws IOException {
		Map<String, String> resStatus = new HashMap<String, String>();
		try {
			HttpGet method = new HttpGet(String.format("%s/cli/environment/getBaseResources?application=%s&environment=%s", this.url, URLEncoder.encode(appName, "UTF-8"), URLEncoder.encode(envName, "UTF-8")));
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			logger.debug(body);

			JSONArray baseResArray = new JSONArray(body);

			for (int i = 0; i < baseResArray.length(); i++) {
				JSONObject res = baseResArray.getJSONObject(i);
				checkResourceStatus(res, resStatus);
			}
		} catch (JSONException e) {
			logger.error("Error when checking resource status", e);
		}
		return resStatus;
	}

	private void checkResourceStatus(JSONObject res, Map<String, String> resStatus) throws IOException {
		try {
			String type = res.getString("type");
			if ("subresource".equalsIgnoreCase(type)) {
				HttpGet method = new HttpGet(String.format("%s/cli/resource?parent=%s", this.url, res.getString("id")));
				HttpResponse response = invokeMethod(method);
				String body = getBody(response);
				logger.debug(body);

				JSONArray resArray = new JSONArray(body);
				for (int i = 0; i < resArray.length(); i++) {
					checkResourceStatus(resArray.getJSONObject(i), resStatus);
				}
			} else if ("agent".equalsIgnoreCase(type)) {
				String name = res.getString("name");
				String status = res.has("status") ? res.getString("status") : null;
				resStatus.put(name, status);
			}
		} catch (JSONException e) {
			logger.error("Failed to parse resource info", e);
		}
	}

	public void deleteEnvironment(String appName, String envName) throws IOException {
		boolean deleteAttachedResources = true;
		boolean deleteCloudInstances = true;
		HttpDelete method = new HttpDelete(String.format("%s/cli/environment/deleteEnvironment?application=%s&environment=%s&deleteAttachedResources=%s&deleteCloudInstances=%s", this.url, URLEncoder.encode(appName, "UTF-8"), URLEncoder.encode(envName, "UTF-8"), deleteAttachedResources, deleteCloudInstances));
		invokeMethod(method);
	}

}
