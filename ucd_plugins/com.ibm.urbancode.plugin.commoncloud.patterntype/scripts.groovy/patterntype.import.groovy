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
	inputPropsStream = new FileInputStream(inputPropsFile);
	inProps.load(inputPropsStream);
} catch (IOException e) {
	throw new RuntimeException(e);
}

final def ptypeFile = inProps['ptypeFile'];
final def cloudHost = inProps['cloudHost'];
final def cloudUser = inProps['cloudUser'];
final def cloudPass = inProps['cloudPass'];
final def cloudType = inProps['cloudType'];
final def cliHome = inProps['cliHome'];

try {
	
	def antFile = new File("$pluginDir/scripts.ant/build.cli.xml");
	assert antFile.exists();
	
	def project = new Project();
	project.init();
	ProjectHelper.projectHelper.parse(project, antFile);
	project.setProperty("dir.cli.extrascripts", "$pluginDir/scripts.python");
	project.setProperty("cloud.host", cloudHost);
	project.setProperty("cloud.user", cloudUser);
	project.setProperty("cloud.pass", cloudPass);
	project.setProperty("cloud.type", cloudType);
	project.setProperty("dir.cli.download", "$cliHome");
	project.setProperty("patterntype.load.file", "$ptypeFile");
	project.executeTarget("patterntype.import");

} catch (Exception e) {
	e.printStackTrace();
	println("Error while importing pattern type!");
	System.exit(1);
} finally {

}

System.exit(0);
