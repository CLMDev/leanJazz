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
final def pyautomationdir = props['pyautomationdir']
final def env = props['envname']
final def envprofile_name1 = props['envprofilename']
final def cloud1_name = props['cloudgroup']
final def ipas_or_iwd_host = props['serverhost']
final def username = props['username']
final def password = props['password']
final def publishonly = props['publishonly']?.toBoolean()
final def lifetime = props['lifetime']

def isipas=true
def pattern_tar_gz_dir  =pyautomationdir+"/files/artifacts/vsysPatterns/"
try {


    def ant = new AntBuilder()

    ant.echo("cloudType:"+ cloudType)
   
    def command=""
    if( cloudType =="IPAS" || cloudType=="ipas") command="$cli_home/$ipas_or_iwd_host/pure.cli/bin/pure";
    else command="$cli_home/$ipas_or_iwd_host/deployer.cli/bin/deployer";
    ant.echo("CLI Tool: $command")   

    def py_properties_src= pyautomationdir + "files/artifacts/vsysPatterns/pyautomation.properties"
    def py_properties_dest= pyautomationdir + "pyautomation.properties"

    ant.echo("move pyautomation.properties file to "+ py_properties_dest)
    ant.move(file:py_properties_src, tofile:py_properties_dest)

    ant.echo("Update pyautomation.properties file")
    ant.propertyfile(file: py_properties_dest) {
    entry(key: "envprofile.name1", value: envprofile_name1, operation: '=')
    entry(key: "cloud1.name", value: cloud1_name, operation: '=')
    entry(key: "deployment.pattern", value: publishonly?"False":"True", operation: '=')
    entry(key: "vs.endtime", value: lifetime, operation: '=')
    }
    ant.replace(file:py_properties_dest, token:"\\:", value:":")

//publish & deploy to ipas/iwd host
      scanner=ant.fileScanner{
      fileset(dir:pattern_tar_gz_dir, includes:"*.gz", excludes:"*/**/*")
      }
      
      for (f in scanner){
      println ("scanner for gunzip:file $f found")
      ant.gunzip(src:f)
      ant.delete(file:f)
      }

      scanner1=ant.fileScanner{
      fileset(dir:pattern_tar_gz_dir, includes:"*.tar", excludes:"*/**/*")
      }

      for (f1 in scanner1){
      println ("scanner for untar file $f1 found")
      ant.untar(src:f1, dest:pattern_tar_gz_dir)
      ant.delete(file:f1)
      }

      scanner2=ant.fileScanner{
      fileset(dir:pattern_tar_gz_dir, includes:"*")
      }

      for (f2 in scanner2.directories()){
      println ("scanner for directory:directory $f2 found")
      ant.move(todir:pattern_tar_gz_dir+"/VSP"){
      fileset(dir: f2)
      }
      }
      ant.exec(executable:command, dir:pyautomationdir, resultproperty:"errorno"){
      arg(line: "-h "+ipas_or_iwd_host+" -u " +username+ " -p " +password+ " -a -f " + pyautomationdir +"/files/tests/VirtualSystems/TestImportDeployPattern.py")
      }
      
      println "retrun code:${ant.project.properties.errorno}"
      System.exit(ant.project.properties.errorno.toInteger())
}
catch (Exception e) {
    e.printStackTrace()
    println "Error publish and deploy virtual system pattern!"
    System.exit(1)
}
finally {
}

System.exit(0)
