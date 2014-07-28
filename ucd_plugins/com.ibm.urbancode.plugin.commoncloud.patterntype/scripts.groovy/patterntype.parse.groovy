#!/usr/bin/env groovy

import groovy.json.JsonSlurper;

final def scriptDir = new File(getClass().protectionDomain.codeSource.location.path).parent;
final def pluginDir = new File(scriptDir).parent;

def workDir = new File('.').canonicalFile;
final def inProps = new Properties();
final def inputPropsFile = new File(args[0]);
try {
	inProps.load(inputPropsFile.newDataInputStream());
} catch (IOException e) {
	throw new RuntimeException(e);
}

final def sourceDir = inProps['sourceDir'];

try {
	
	def writer = new File(args[1]).newWriter();
	
	def ant = new AntBuilder();
	
	scanner = ant.fileScanner{
		fileset(dir:sourceDir, includes:"*.tgz", excludes:"*/**/*");
	}
	
	def ptypeFile;
	def count = 0;
	for (file in scanner) {
		println("Scanner for pattern types found $file");
		ptypeFile = file;
		count++;
	}
	assert count == 1;
	
	writer.writeLine("ptypeFile=$ptypeFile");
	
	def ptypeFileName = ptypeFile.name.lastIndexOf('.').with {it != -1 ? ptypeFile.name[0..<it] : ptypeFile.name};
	def ptype = ptypeFileName.split("-");
	String ptypeName = ptype[0];
	String ptypeVersion = ptype[1];
	println("Found pattern type $ptypeName version $ptypeVersion");
	
	ant.delete(dir:"$sourceDir/t");
	
	writer.writeLine("ptypeName=$ptypeName");
	writer.writeLine("ptypeVersion=$ptypeVersion");
	
	ant.untar(src:ptypeFile, dest:"$sourceDir/t", compression:"gzip") {
		patternset() {
			include(name:"plugins/*.tgz");
		}
	}
	if (new File("$sourceDir/t/plugins").exists()) {
		println("Found plugins folder, checking plugins ... ");
		scanner = ant.fileScanner {
			fileset(dir:"$sourceDir/t/plugins", includes:"*.tgz");
		}
		if (scanner.hasFiles()) {
			for (pluginFile in scanner) {
				println ("Scanner for plugins found $pluginFile");
				def pluginFileName = pluginFile.name.lastIndexOf('.').with {it != -1 ? pluginFile.name[0..<it] : pluginFile.name};
				ant.untar(src:pluginFile, dest:"$pluginFile/../$pluginFileName", compression:"gzip") {
					patternset() {
						include(name:"applications/*.zip");
					}
				}
			}
			scanner = ant.fileScanner {
				fileset(dir:"$sourceDir/t/plugins", includes:"**/applications/*.zip");
			}
			if (scanner.hasFiles()) {
				for (appFile in scanner) {
					println ("Scanner for applications found $appFile");
					def appFileName = appFile.name.lastIndexOf('.').with {it != -1 ? appFile.name[0..<it] : appFile.name};
					ant.unzip(src:appFile, dest:"$appFile/../$appFileName") {
						patternset() {
							include(name:"appmodel.json");
						}
					}
				}
				scanner = ant.fileScanner {
					fileset(dir:"$sourceDir/t/plugins", includes:"**/applications/**/appmodel.json");
				}
				if (scanner.hasFiles()) {
					def slurper = new JsonSlurper();
					String sharedServiceName;
					String sharedServiceVersion;
					for (jsonFile in scanner) {
						def model = slurper.parseText(jsonFile.text).model;
						if (model.app_type == "service") {
							sharedServiceName = model.servicename;
							sharedServiceVersion = model.serviceversion;
							println ("Scanner for shared service found $sharedServiceName version $sharedServiceVersion");
						}
					}
				
					writer.writeLine("sharedServiceName=$sharedServiceName");
					writer.writeLine("sharedServiceVersion=$sharedServiceVersion");
				}
			}
		}
	} else {
		println("No plug-in found inside pattern type, skipping ... ");
	}
	
	writer.close();

	ant.delete(dir:"$sourceDir/t");
	
} catch (Exception e) {
	e.printStackTrace();
	println("Error configure CLI for cloud provider!");
	System.exit(1);
} finally {

}

System.exit(0);
