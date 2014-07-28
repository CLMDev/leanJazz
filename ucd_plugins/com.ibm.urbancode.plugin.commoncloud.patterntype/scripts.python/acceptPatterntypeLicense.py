#
#  Copyright 2014 IBM
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#

# Accept License of Pattern Type
#
# This script is called as follows:
#
# deployer <deployer_options> -f cli.scripts/acceptPatterntypeLicense.py
#	 -n|--name <pattern type name>
#	 -v|--version <pattern type version>
#

import deployer
import getopt, os, sys

# print help and exit
def help():
	print "deployer <deployer_options> -f cli.scripts/acceptPatterntypeLicense.py";
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
	print >>sys.stderr, "Cannot find pattern type with name: " + name + " version: " + version;
	help();
	sys.exit(1);
	
try:
	patterntype.acceptLicense();
except Exception, err:
	print >>sys.stderr, str(err);
	print >>sys.stderr, "Failed to accept license of pattern type with name:" + name + " version: " + version;
	sys.exit(1);
