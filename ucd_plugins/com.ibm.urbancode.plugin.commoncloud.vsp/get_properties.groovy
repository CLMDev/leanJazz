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
final def workDir = new File('.').canonicalFile
final def scriptDir = new File(getClass().protectionDomain.codeSource.location.path).parent
final def props = new Properties()
final def inputPropsFile = new File(args[0])
try {
	inputPropsStream = new FileInputStream(inputPropsFile)
	props.load(inputPropsStream)
}
catch (IOException e) {
	throw new RuntimeException(e)
}

println "Directory Location: $scriptDir"

def cloudType = props['cloudType']
def cli_home= props['cli_home']
def hostname = props['hostname']
def username = props['username']
def password = props['password']
def skip = props["skip"]?.toBoolean()

def exe = ""

if (!skip) {
	if ( cloudType =="ipas" || cloudType =="IPAS") 
          exe = "$cli_home/$hostname/pure.cli/bin/pure"
	else 
          exe = "$cli_home/$hostname/deployer.cli/bin/deployer"
        def ant = new AntBuilder()

	try {
		ant.exec(executable:"$exe", dir:workDir) {
			arg(line: "-h $hostname -u $username -p $password -a -f $scriptDir/cleanup.py ${args[0]} $scriptDir")
		}
	}
	catch (Exception e) {
		println "Error running the cleanup script."
		e.printStackTrace()
		System.exit(1)
	}
}
else {
	println "Step Skipped"
}

System.exit(0)
