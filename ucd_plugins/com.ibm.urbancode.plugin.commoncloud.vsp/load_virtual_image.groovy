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
def workDir = new File('.').canonicalFile
final def props = new Properties();
final def inputPropsFile = new File(args[0]);
try {
    inputPropsStream = new FileInputStream(inputPropsFile);
    props.load(inputPropsStream);
}
catch (IOException e) {
    throw new RuntimeException(e);
}
final def scriptDir = new File(getClass().protectionDomain.codeSource.location.path).parent;
final def pluginDir = new File(scriptDir).parent;

final def cloudType = props['cloudType'];
final def cli_home= props['cli_home'];
final def cloud1_name = props['cloudgroup']
final def hostname = props['hostname']
final def username = props['username']
final def password = props['password']
final def acceptlicense = props['acceptlicense']?.toBoolean()
final def propertyfile = props['propertyfile']

try {

    def ant = new AntBuilder()

    ant.echo("cloudType:"+ cloudType)
   
    def command=""
    if( cloudType =="IPAS" || cloudType=="ipas") command="$cli_home/$hostname/pure.cli/bin/pure";
    else command="$cli_home/$hostname/deployer.cli/bin/deployer";
    ant.echo("CLI Tool: $command")   

    pyfile="$scriptDir/load_image_and_accept_license.py"
    tofile="$scriptDir/copy_load_image_and_accept_license.py"

 
    ant.copy(file: pyfile, tofile:tofile, overwrite:true)

    ant.replace(file: tofile, replacefilterfile: propertyfile)

    ant.exec(executable:command, dir:workDir, resultproperty:"errorno"){
      if(acceptlicense)
        arg(line: "-h "+hostname+" -u " +username+ " -p " +password+ " -a -f " + tofile +" -a")
      else
        arg(line: "-h "+hostname+" -u " +username+ " -p " +password+ " -a -f " + tofile)

    }
      
      println "retrun code:${ant.project.properties.errorno}"
      System.exit(ant.project.properties.errorno.toInteger())
}
catch (Exception e) {
    e.printStackTrace()
    println "Error loading the virtual image!"
    System.exit(1)
}
finally {
}

System.exit(0)
