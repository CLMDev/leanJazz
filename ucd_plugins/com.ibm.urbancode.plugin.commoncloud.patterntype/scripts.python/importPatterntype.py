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
# Import Pattern Type to IBM Workload Deployer
#
# This script is called as follows:
#
# deployer <deployer_options> -f cli.scripts/importPatterntype.py
#	 -s|--source <filename>
#
# Where:
#
# -s|--source <filename>
#	 Specifies a .tgz/.tar.gz file for pattern type import
#

import deployer
import getopt, os, sys

# print help and exit
def help():
	print "deployer <deployer_options> -f cli.scripts/importPatterntype.py";
	print "	-s|--source <filename>";
	sys.exit(1);
   

options = []
# parse command line arguments
try:
	(options, args) = getopt.getopt(sys.argv[1:], 's:h', ['source=', 'help=']);
except getopt.GetoptError, err:
	print str(err);
	help();


source = None;
patterntype = None;

for opt, arg in options:
	if opt in ('-s', '--source'):
		source = arg;
	elif opt in ('-h', '--help'):
		help();
	else:
		assert False, "unhandled option";

if (source is None):
	print >>sys.stderr, "The source file should be provided.";
	sys.exit(1);
	
if (not os.path.exists(source)):
	print >>sys.stderr, "The source file does not exist.";
	sys.exit(1);
	
if not source.endswith('.tgz') and not source.endswith('.tar.gz'):
	print >>sys.stderr, "The source file should be a .tgz or .tar.gz file";
	sys.exit(1);

patterntype = deployer.patterntypes.get(name, version);

if (patterntype is None):
	try:
		deployer.patterntypes.create(source);
	except Exception, err:
		print >>sys.stderr, str(err);
		print >>sys.stderr, "Failed to import pattern type.";
		sys.exit(1);
else:
	print >>sys.stdout, "Pattern type with name: " + name + " version: " + version + " already exists, skipping import pattern...";
	sys.exit(2);
