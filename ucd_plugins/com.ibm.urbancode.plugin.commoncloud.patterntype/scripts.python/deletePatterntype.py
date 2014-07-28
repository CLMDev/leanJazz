# Delete Pattern Type
#
# This script is called as follows:
#
# deployer <deployer_options> -f cli.scripts/deletePatterntype.py
#	 -n|--name <pattern type name>
#	 -v|--version <pattern type version>
#

import deployer
import getopt, os, sys

# print help and exit
def help():
	print "deployer <deployer_options> -f cli.scripts/deletePatterntype.py";
	print "	-n|--name <pattern type name>";
	print "	-v|--version <pattern type version>";
	sys.exit(1);
   

options = [];
# parse command line arguments
try:
	(options, args) = getopt.getopt(sys.argv[1:], 'n:v:h', ['name=', 'version=', 'help']);
except getopt.GetoptError, err:
	print str(err);
	help();


name = None;
version = None;
patterntype = None;

for opt, arg in options:
	if opt in ('-h', '--help'):
		help();
	elif opt in ('-n', '--name'):
		name = arg;
	elif opt in ('-v', '--version'):
		version = arg;
	else:
		assert False, "unhandled option";
	
if (name is None):
	print >>sys.stderr, "Pattern type name must be provided.";
	help();
	sys.exit(1);

if (version is None):
	print >>sys.stderr, "Pattern type version must be provided.";
	help();
	sys.exit(1);

patterntype = deployer.patterntypes.get(name, version);

if (patterntype is None):
	print >>sys.stdout, "Cannot find pattern type with name: " + name + " version: " + version + ", skipping delete pattern...";
	sys.exit(0);
	
try:
	deployer.patterntypes.delete(name, version);
except:
	print >>sys.stderr, "Failed to delete pattern type with name:" + name + " version: " + version;
	sys.exit(1);
