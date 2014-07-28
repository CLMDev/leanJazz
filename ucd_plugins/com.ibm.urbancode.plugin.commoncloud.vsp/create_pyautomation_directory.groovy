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

final def destdir = props['destdir']
try {

    def ant = new AntBuilder()
    ant.echo("Preparing pyautomation directory...")
    final def py_zip = "$scriptDir/pyautomation.zip";
    ant.echo("py_zip:$py_zip")
    ant.echo("destdir:$destdir")
    ant.unzip(src:py_zip, dest:"$destdir");

    vsysdir= destdir + "/files/artifacts/vsysPatterns/";
    ant.echo("Clean vsyspattern dir" + vsysdir)
   
    ant.delete(dir:vsysdir)
    ant.mkdir(dir:vsysdir)
    def writer = new File(args[1]).newWriter();
    writer.writeLine("destdir=$destdir");
    writer.close();
}
catch (Exception e) {
    e.printStackTrace()
    println "Error creating pyautomation working directory!"
    System.exit(1)
}
finally {
}

System.exit(0)
