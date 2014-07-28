# Accept License of Pattern Type
#
# This script is called as follows:
#
# deployer <deployer_options> -f cli.scripts/deploySharedService.py
#	 -n|--name <service name>
#	 -v|--version <service version>
# 	 -p|--profile <environment profile>";
# 	 -i|--ipgroup <ip group>";
# 	 -c|--cloudgroup <cloud group>";
# 	 -k|--publickey <path of public key file>";
# 	 -d|--deployment <deployment parameters>";
#

import deployer
import getopt, os, sys

# print help and exit
def help():
	print "deployer <deployer_options> -f cli.scripts/deploySharedService.py";
	print "	-n|--name <service name>";
	print "	-v|--version <service version>";
	print "	-p|--profile <environment profile>";
	print "	-i|--ipgroup <ip group>";
	print "	-c|--cloudgroup <cloud group>";
	print "	-k|--publickey <path of public key file>";
	print "	-d|--deployment <deployment parameters>";
	sys.exit(1);


options = [];
# parse command line arguments
try:
	(options, args) = getopt.getopt(sys.argv[1:], 'n:v:p:i:c:k:d:h', ['name=', 'version=', 'profile=', 'ipgroup=', 'cloudgroup=', 'publickey=', 'deployment=', 'help']);
except getopt.GetoptError, err:
	print str(err);
	help();


name = None;
version = None;
shared_service = None;
env_profile_name = None;
ip_group_name = None;
ip_version = 'IPv4';
cloud_group_name = None;
public_key = None;
depl_param_file = None;

for opt, arg in options:
	if opt in ('-h', '--help'):
		help();
	elif opt in ('-n', '--name'):
		name = arg;
	elif opt in ('-v', '--version'):
		version = arg;
	elif opt in ('-p', '--profile'):
		env_profile_name = arg;
	elif opt in ('-i', '--ipgroup'):
		ip_group_name = arg;
	elif opt in ('-c', '--cloudgroup'):
		cloud_group_name = arg;
	elif opt in ('-k', '--publickey'):
		public_key = arg;
	elif opt in ('-d', '--deployment'):
		depl_param_file = arg;
	else:
		assert False, "unhandled option";
	
if (name is None):
	print >>sys.stderr, "Service name must be provided.";
	help();
	sys.exit(1);

if (version is None):
	print >>sys.stderr, "Service version must be provided.";
	help();
	sys.exit(1);

if (env_profile_name is None):
	print >>sys.stderr, "Environment profile must be provided.";
	help();
	sys.exit(1);

if (ip_group_name is None):
	print >>sys.stderr, "IP group must be provided.";
	help();
	sys.exit(1);

if (ip_version is None):
	print >>sys.stderr, "IP version must be provided.";
	help();
	sys.exit(1);

if (cloud_group_name is None):
	print >>sys.stderr, "Cloud group must be provided.";
	help();
	sys.exit(1);

try:
	shared_service = deployer.sharedservices.list({ 'service_name' : name, 'service_version': version })[0];
	
	if (shared_service is None):
		print >>sys.stderr, "Cannot find shared service with name: " + name + " version: " + version;
		help();
		sys.exit(1);
		
	app_id = shared_service.app_id;
	
	environment_profile = deployer.environmentprofiles[env_profile_name];
	if environment_profile is None or len(environment_profile) != 1:
		print >>sys.stderr, "Failed to locate environment profile with unique name: " + env_profile_name;
		sys.exit(1);
	environment_profile = environment_profile[0];
	
	cloud_group = deployer.clouds[cloud_group_name];
	if cloud_group is None or len(cloud_group) != 1:
		print >>sys.stderr, "Failed to locate cloud group with unique name: " + cloud_group_name;
		sys.exit(1);
	cloud_group = cloud_group[0];
	
	ip_group = deployer.ipgroups[ip_group_name];
	if ip_group is None or len(ip_group) != 1:
		print >>sys.stderr, "Failed to locate ip group with unique name: " + ip_group_name;
		sys.exit(1);
	ip_group = ip_group[0];
	
	env_dict = {
			'environment_profile' : environment_profile, 
			'cloud_group' : cloud_group,
			'ip_group' : ip_group,
			'ip_version' : ip_version
	};
	
	
	if depl_param_file is not None and os.path.exists(depl_param_file):
		depl_parameters = shared_service.listConfig();
		print >>sys.stdout, "Default deployment parameters: " + str(depl_parameters);
		f = open(depl_param_file, 'r');
		for line in f:
			if line.startswith("#"):
				continue;
			else:
				p = line.split("=");
				key = p[0].strip();
				val = p[1].strip();
				depl_parameters[key] = val;
		print >>sys.stdout, "Updated deployment parameters: " + str(depl_parameters);
		ss_instance = shared_service.start(env_dict, depl_parameters, public_key);
	
	ss_instance = shared_service.start(env_dict, None, public_key);
	
	print >>sys.stdout, str(ss_instance);
	
except Exception, err:
	print >>sys.stderr, str(err);
	print >>sys.stderr, "Failed deploy shared service with pattern type :" + name;
	sys.exit(1);
