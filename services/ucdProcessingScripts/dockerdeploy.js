// JAVASCRIPT TO PARSE THE CONSOLE LOG AND DETERMINE PASS / FAIL STATUS BASED ON THE TEST RESULTS
// looking for something like this line 
//     Successfully built
// checking that we dont see any errors like 
// 		HTTP code: 404 

// assume success
commandOut.print("==== Starting post processing ====\n");
properties.put("Status", "Success");

// Evaluate the built-in exitCode property, which indicates the exit code
// of the script called by the plug-in step. Typically, if the value of
// the exitCode property is non-zero, the plug-in step failed.
//
if (properties.get("exitCode") != 0) {
    properties.put("Status", "Failure");
    commandOut.print("exitCode!=0, so fail\n");
}
else {
    commandOut.print("exitCode=0, parse log file\n");
	//look for 404 error codes that indicates the image is not located in the registry 
	scanner.register(".*HTTP code: 404.*", function(lineNumber, line) {
		commandOut.print("registered scanner found " + line + "\n");
		commandOut.print("this is an indication that the image was not found in the docker registry \n")
		properties.put("Status", "Failure");	
	});
	//look for common error message
	scanner.register(".*Unable to find image.*", function(lineNumber, line) {
		commandOut.print("registered scanner found " + line + "\n");
		commandOut.print("this is an indication that the image was not found in the docker registry \n")
		properties.put("Status", "Failure");	
	});
	
	//find the container id
 	scanner.register("^[a-z0-9]+$", function(lineNumber, line) {
		commandOut.print("registered scanner containerid:" + line + "\n");
		properties.put("containerid", line);
	});
    scanner.scan();
}	

commandOut.print("\n \nStep status has been set to [" + properties.get("Status") + "]\n")
commandOut.print("==== End of post processing ====\n");
