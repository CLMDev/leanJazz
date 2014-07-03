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
	//404 responses are an indication that the image could not connect when running apt-get etc 
	scanner.register(".*HTTP code: 404.*", function(lineNumber, line) {
		commandOut.print("registered scanner processing " + line + "\n");
		properties.put("Status", "Failure");	
	});
	//check that the image was built successfully and set a property so that the ID of the 
	//image can be looked up later using	
	var imagesbuilt = 0;
	scanner.register(".*Successfully built", function(lineNumber,line){
		commandOut.print("registered scanner processing " + line + "\n");
		imagesbuilt++;
		var imageid = line.replace("Successfully built ", "");
		commandOut.print("imageid is:" + imageid + "\n");
		properties.put("imageid",imageid);
	});
    scanner.scan();
    if (imagesbuilt === 0){
    	commandOut.print("Did not find any successfully built images \n");
		properties.put("Status", "Failure");	
    }
    else{
    	commandOut.print("Number of successfully built images: " + imagesbuilt + "\n");
    	properties.put("Status", "Success");
    }
}	

commandOut.print("\n \nStep status has been set to [" + properties.get("Status") + "]\n")
commandOut.print("==== End of post processing ====\n");