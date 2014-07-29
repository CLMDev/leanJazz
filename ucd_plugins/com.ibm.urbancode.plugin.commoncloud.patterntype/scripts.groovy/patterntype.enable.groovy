#!/usr/bin/env groovy
/**
*  Copyright 2014 IBM
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/
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

final def cloudHost = inProps['cloudHost'];
final def cloudUser = inProps['cloudUser'];
final def cloudPass = inProps['cloudPass'];
final def cloudType = inProps['cloudType'];
final def cliHome = inProps['cliHome'];

final def ptypeName = inProps['ptypeName'];
final def ptypeVersion = inProps['ptypeVersion'];

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
	project.setProperty("patterntype.name", "$ptypeName");
	project.setProperty("patterntype.version", "$ptypeVersion");
	project.executeTarget("patterntype.enable");

} catch (Exception e) {
	e.printStackTrace();
	println("Error while enabling pattern type!");
	System.exit(1);
} finally {

}

System.exit(0);
