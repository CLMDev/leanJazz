/**
 * 
 */
package com.ibm.sts.ucd.services;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.apache.log4j.Logger;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.ibm.sts.ucd.data.EnvironmentStatus;
import com.ibm.sts.ucd.utils.StringUtils;
import com.ibm.sts.ucd.utils.UCDClient;

/**
 * @author Super Wang
 *
 */
@ApplicationScoped
@Path("/ucd")
public class UCDService {
	
	private static final Logger logger = Logger.getLogger(UCDService.class.getSimpleName());

	@GET
	@Path("applications")
	@Produces({MediaType.APPLICATION_JSON})
	public Response listApplications(
			@HeaderParam("UCD_SERVER") String ucdServer, @HeaderParam("UCD_USERNAME") String ucdUsername, @HeaderParam("UCD_PASSWORD") String ucdPassword) {
		this.checkHeaderParams(ucdServer, ucdUsername, ucdPassword);
		try {
			UCDClient client = new UCDClient(new URI(ucdServer), ucdUsername, ucdPassword);
			String applications = client.listApplications();
			return Response.ok(applications).build();
		} catch (URISyntaxException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid UCD Server URL: %s", ucdServer)).build();
		} catch (IOException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Error when listing applications")).build();
		}
	}
	
	@PUT
	@Path("applications/{appName}/requestApplicationProcess")
	@Consumes({MediaType.APPLICATION_JSON})
	@Produces({MediaType.APPLICATION_JSON})
	public Response requestApplicationProcess(
			@HeaderParam("UCD_SERVER") String ucdServer, @HeaderParam("UCD_USERNAME") String ucdUsername, @HeaderParam("UCD_PASSWORD") String ucdPassword,
			@PathParam("appName") String appName, String content) {
		this.checkHeaderParams(ucdServer, ucdUsername, ucdPassword);
		try {
			JSONObject json = new JSONObject(content);
			json.put("application", appName);
			
			UCDClient client = new UCDClient(new URI(ucdServer), ucdUsername, ucdPassword);
			String result = client.applicationProcessRequest(json.toString());			
			return Response.status(Status.CREATED).entity(result).build();
		} catch (JSONException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid content of request: %s", content)).build();
		} catch (URISyntaxException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid UCD Server URL: %s", ucdServer)).build();
		} catch (IOException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Error when request process with content: %s", content)).build();
		}
	}
	
	@GET
	@Path("applications/{appName}/requestApplicationProcess/{requestId}")
	@Produces({MediaType.APPLICATION_JSON})
	public Response getRequestStatus(
			@HeaderParam("UCD_SERVER") String ucdServer, @HeaderParam("UCD_USERNAME") String ucdUsername, @HeaderParam("UCD_PASSWORD") String ucdPassword,
			@PathParam("appName") String appName, @PathParam("requestId") String requestId) {
		this.checkHeaderParams(ucdServer, ucdUsername, ucdPassword);
		try {
			UCDClient client = new UCDClient(new URI(ucdServer), ucdUsername, ucdPassword);
			String status = client.getRequestStatus(requestId);
			return Response.ok(status).build();
		} catch (URISyntaxException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid UCD Server URL: %s", ucdServer)).build();
		} catch (IOException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Error when geting status for request '%s' in application '%s'", requestId, appName)).build();
		}
	}
	
	@GET
	@Path("applications/{appName}/blueprints")
	@Produces({MediaType.APPLICATION_JSON})
	public Response listBlueprintsByApplication(
			@HeaderParam("UCD_SERVER") String ucdServer, @HeaderParam("UCD_USERNAME") String ucdUsername, @HeaderParam("UCD_PASSWORD") String ucdPassword,
			@PathParam("appName") String appName) {
		this.checkHeaderParams(ucdServer, ucdUsername, ucdPassword);
		try {
			UCDClient client = new UCDClient(new URI(ucdServer), ucdUsername, ucdPassword);
			String blueprints = client.listBlueprintsByApplication(appName);
			return Response.ok(blueprints).build();
		} catch (URISyntaxException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid UCD Server URL: %s", ucdServer)).build();
		} catch (IOException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Error when getting blueprints of application: %s", appName)).build();
		}
	}

	@GET
	@Path("applications/{appName}/blueprints/{blueprintName}")
	@Produces({MediaType.APPLICATION_JSON})
	public Response getBlueprintNodeProperties(
			@HeaderParam("UCD_SERVER") String ucdServer, @HeaderParam("UCD_USERNAME") String ucdUsername, @HeaderParam("UCD_PASSWORD") String ucdPassword,
			@PathParam("appName") String appName, @PathParam("blueprintName") String blueprintName) {
		this.checkHeaderParams(ucdServer, ucdUsername, ucdPassword);
		try {
			UCDClient client = new UCDClient(new URI(ucdServer), ucdUsername, ucdPassword);
			String nodeProps = client.getBlueprintNodeProperties(appName, blueprintName);
			return Response.ok(nodeProps).build();
		} catch (URISyntaxException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid UCD Server URL: %s", ucdServer)).build();
		} catch (IOException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Error when getting properties of blueprint %s in application: %s", blueprintName, appName)).build();
		}
	}

	@PUT
	@Path("applications/{appName}/environments")
	@Consumes({MediaType.APPLICATION_JSON})
	@Produces({MediaType.TEXT_PLAIN})
	public Response createEnvironment(
			@HeaderParam("UCD_SERVER") String ucdServer, @HeaderParam("UCD_USERNAME") String ucdUsername, @HeaderParam("UCD_PASSWORD") String ucdPassword,
			@PathParam("appName") String appName, String content) {
		this.checkHeaderParams(ucdServer, ucdUsername, ucdPassword);
		try {
			JSONObject json = new JSONObject(content);
			json.put("application", appName);
			
			UCDClient client = new UCDClient(new URI(ucdServer), ucdUsername, ucdPassword);
			
			UUID uuid = client.createEnvironment(json.toString());
			if (uuid == null) {
				return Response.status(Status.BAD_REQUEST).entity(String.format("Failed to create environment with topology doc: %s", content)).build();
			}
			return Response.status(Status.CREATED).location(new URI(String.format("%s/cli/environment/info?environment=%s", ucdServer, uuid))).entity(uuid.toString()).build();
		} catch (JSONException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid content of topology doc: %s", content)).build();
		} catch (URISyntaxException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid UCD Server URL: %s", ucdServer)).build();
		} catch (IOException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Error when creating environment with topology doc: %s", content)).build();
		}
	}

	@PUT
	@Path("applications/{appName}/environments/{envName}")
	@Consumes({MediaType.APPLICATION_JSON})
	@Produces({MediaType.TEXT_PLAIN})
	public Response addEnvironmentToTeam(
			@HeaderParam("UCD_SERVER") String ucdServer, @HeaderParam("UCD_USERNAME") String ucdUsername, @HeaderParam("UCD_PASSWORD") String ucdPassword,
			@PathParam("appName") String appName, @PathParam("envName") String envName, String content) {
		
		this.checkHeaderParams(ucdServer, ucdUsername, ucdPassword);
		try {
			JSONObject json = new JSONObject(content);
			String team;
			
			if(json.has("team"))
					team=json.get("team").toString();
			else 
				return Response.status(Status.BAD_REQUEST).entity(String.format("Failed to add environment to team: %s", content)).build();
			
			UCDClient client = new UCDClient(new URI(ucdServer), ucdUsername, ucdPassword);
			
			client.addEnvironmentToTeam(appName, envName, team);
			
			return Response.status(Status.CREATED).build();
		} catch (JSONException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid content of team: %s", content)).build();
		} catch (URISyntaxException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid UCD Server URL: %s", ucdServer)).build();
		} catch (IOException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Error when adding environment to team: %s", content)).build();
		}
	}
	
	@GET
	@Path("applications/{appName}/environments/{envName}/ping")
	@Produces({MediaType.APPLICATION_JSON})
	public Response getEnvironmentStatus(
			@HeaderParam("UCD_SERVER") String ucdServer, @HeaderParam("UCD_USERNAME") String ucdUsername, @HeaderParam("UCD_PASSWORD") String ucdPassword,
			@PathParam("appName") String appName, @PathParam("envName") String envName) {
		this.checkHeaderParams(ucdServer, ucdUsername, ucdPassword);
		try {
			UCDClient client = new UCDClient(new URI(ucdServer), ucdUsername, ucdPassword);
			EnvironmentStatus status = client.getEnvironmentStatus(appName, envName);
			if (status == null) {
				return Response.status(Status.NOT_FOUND).build();
			}
			return Response.ok(status).build();
		} catch (URISyntaxException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid UCD Server URL: %s", ucdServer)).build();
		}
	}

	@DELETE
	@Path("applications/{appName}/environments/{envName}")
	@Produces({MediaType.TEXT_PLAIN})
	public Response deleteEnvironment(
			@HeaderParam("UCD_SERVER") String ucdServer, @HeaderParam("UCD_USERNAME") String ucdUsername, @HeaderParam("UCD_PASSWORD") String ucdPassword,
			@PathParam("appName") String appName, @PathParam("envName") String envName) {
		this.checkHeaderParams(ucdServer, ucdUsername, ucdPassword);
		try {
			UCDClient client = new UCDClient(new URI(ucdServer), ucdUsername, ucdPassword);
			logger.info(String.format("Deleting environment '%s' in application '%s'", envName, appName));
			client.deleteEnvironment(appName, envName);
		} catch (URISyntaxException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid UCD Server URL: %s", ucdServer)).build();
		} catch (IOException e) {
			logger.error(e.getLocalizedMessage(), e);
			return Response.status(Status.BAD_REQUEST).entity(String.format("Error when deleting environment '%s' in application '%s'", envName, appName)).build();
		}
		return Response.status(Status.ACCEPTED).build();
	}
	
	private void checkHeaderParams(String ucdServer, String ucdUsername, String ucdPassword) {
		if (StringUtils.isBlank(ucdServer)) {
			throw new WebApplicationException(Response.status(Status.BAD_REQUEST).entity(String.format("Missing UCD_SERVER paramter in header.")).build());
		}
		if (StringUtils.isBlank(ucdUsername)) {
			throw new WebApplicationException(Response.status(Status.BAD_REQUEST).entity(String.format("Missing UCD_USERNAME paramter in header.")).build());
		}
		if (StringUtils.isBlank(ucdPassword)) {
			throw new WebApplicationException(Response.status(Status.BAD_REQUEST).entity(String.format("Missing UCD_PASSWORD paramter in header.")).build());
		}
	}

}
