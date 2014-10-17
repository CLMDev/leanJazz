package com.ibm.nvb.ucd;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;

import com.ibm.sts.ucd.utils.UCDClient;

public class Main {
	
	private static void printUsage() {
	}
	
	public static void main(String[] args) {
		if (args.length <= 4) {
			printUsage();
			System.exit(400);
		}
		
		URI ucdUrl = null;
		try {
			ucdUrl = new URI(args[0]);
		} catch (URISyntaxException e) {
			
		}
		if (ucdUrl == null) {
			System.err.println(String.format("Invalid format of UCD endpoint: %s", args[0]));
			printUsage();
			System.exit(400);
		}
		String clientUser = args[1];
		String clientPassword = args[2];
		
		UCDClient client = new UCDClient(ucdUrl, clientUser, clientPassword);
		
		String action = args[3].toLowerCase();
		String appName;
		String envName;
		switch(action) {
		case "create":
			if (args.length < 5) {
				printUsage();
				System.exit(400);
			}
			URI topoDocURI = null;
			try {
				topoDocURI = new URI(args[4]);
			} catch (URISyntaxException e) {
				
			}
			if (topoDocURI == null) {
				System.err.println(String.format("Invalid format of topology documentation URI: %s", args[5]));
				printUsage();
				System.exit(400);
			}
			try {
				UUID uuid = client.createEnvironment(topoDocURI);
				System.exit(uuid == null ? -1 : 0);
			} catch (IOException e) {
				e.printStackTrace();
				System.exit(-1);
			}
			break;
		case "ping":
			if (args.length < 6) {
				printUsage();
				System.exit(400);
			}
			appName = args[4];
			envName = args[5];
			try {
				boolean online = client.getEnvironmentStatus(appName, envName).isOnline();
				System.exit(online ? 0 : -1);
			} catch (IOException e) {
				e.printStackTrace();
				System.exit(500);
			}
			break;
		case "delete":
			if (args.length < 6) {
				printUsage();
				System.exit(400);
			}
			appName = args[4];
			envName = args[5];
			try {
				client.deleteEnvironment(appName, envName);
				System.exit(0);
			} catch (IOException e) {
				e.printStackTrace();
				System.exit(-1);
			}
			break;
		default:
			System.err.println(String.format("Unknown action: %s", action));
			printUsage();
			System.exit(400);
			break;
		}
		
	}

}
