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
