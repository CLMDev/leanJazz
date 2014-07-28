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
