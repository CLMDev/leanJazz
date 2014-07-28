#!/usr/bin/env groovy

import org.apache.tools.ant.Project;
import org.apache.tools.ant.ProjectHelper;
import org.apache.tools.ant.PropertyHelper;

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

final def cloudHost = inProps['cloudHost'];
final def cloudType = inProps['cloudType'];

final def cliBase = inProps['cliBase'];
final def cliHome = new File("$cliBase/$cloudHost");

try {
	
	def ant = new AntBuilder();
	ant.mkdir(dir:cliHome);
	
	if (cloudType == "ipas") {
		final def cliFile = "$pluginDir/cli/pure.cli.zip";
		ant.unzip(src:cliFile, dest:"$cliHome");
	} else if (cloudType == "iwd") {
		final def cliFile = "$pluginDir/cli/deployer.cli.zip";
		ant.unzip(src:cliFile, dest:"$cliHome");
	} else {
		println("Unsupported cloud type $cloudType !");
		System.exit(1);
	}
	
	ant.chmod(perm:"ugo+rx") {
		fileset(dir:"$cliHome");
	}
	
	def writer = new File(args[1]).newWriter();
	writer.writeLine("cliHome=$cliHome");
	writer.writeLine("cloudHost=$cloudHost");
	writer.writeLine("cloudType=$cloudType");
	writer.close();

} catch (Exception e) {
	e.printStackTrace();
	println("Error configure CLI for cloud provider!");
	System.exit(1);
} finally {

}

System.exit(0);
