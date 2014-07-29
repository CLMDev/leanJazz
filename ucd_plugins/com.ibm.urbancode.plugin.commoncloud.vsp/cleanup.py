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
# fix for python 2.6 'with' keyword reserved exeception
from __future__ import with_statement
import sys, re
from datetime import datetime, timedelta

propsFile = sys.argv[1]
scriptDir = sys.argv[2]

with open(propsFile, 'r') as f:
	props = {}
	for line in f:
		if line.startswith("#"):
			continue
		else:
			p = line.split("=")
			key = p[0].strip()
			val = p[1].strip()
			props[key] = val

hostName = props['hostname']
resourceNames = props['resourceNames']
excludedResources = props['excludedResources']
cleanupMethod = props["method"]

if "patterns" in cleanupMethod.lower():
	resourceOlderThan = int(props['resourceOlderThan'])
else:
	import os
	if not scriptDir in sys.path:
		sys.path.append(scriptDir)

	try:
		from deleteUnusedImages import RemoveImages
		from removeUnusedScripts import RemoveScripts
	except ImportError:
		sys.stderr.write("Error loading cleanup module for '%s'." % cleanupMethod)

resourceNames = [name.strip().replace('"', '') for name in resourceNames.split(",")]
resourceNames = filter(None, resourceNames)

excludedResources = [name.strip().replace('"', '') for name in excludedResources.split(",")]
excludedResources = filter(None, excludedResources)

def cleanup_patterns(patterns=[], excluded=[], patterns_older_than=2):
	all_patterns = deployer.patterns
	print "Cleaning up unused patterns..."
	
	if not excluded:
		excluded = []
	else:
		print "Patterns that match the following queries will be skipped: %s" % excluded
	if not patterns_older_than:
		patterns_older_than = 2
	
	# remove excluded patterns from all patterns
	excludes = []
	for p in all_patterns:
		for i in excluded:
			if i.lower() in p.name.lower():
				excludes.append(p)
	
	all_patterns = list(set(all_patterns) - set(excludes))
	
	if not patterns:
		print "No pattern specified. Starting automatic cleanup..."
		
		keepmeExists = True if deployer.users["keepme"] else False
		
		for pattern in all_patterns:
			if len(pattern.virtualsystems) < 1:
				if datetime.now() - datetime.fromtimestamp(pattern.created) > timedelta(days = patterns_older_than):
					if keepmeExists:
						keepme = True if deployer.users["keepme"][0] in pattern.acl else False
					else:
						keepme = False
					if not keepme:
						# pattern.delete()
						print "'%s' has been deleted." % pattern.name
					else:
						print "Unable to delete pattern '%s' because the author has granted access to 'keepme'." % pattern.name
			else:
				print "Skipping pattern deletion for '%s' because %i virtual system %s associated with it." % (pattern.name, len(pattern.virtualsystems), "instances are" if len(pattern.virtualsystems) > 1 else "instance is")
		print "Pattern clean up completed."
	else:
		print "Patterns specified: %s. Searching for the specified patterns to be cleaned up..." % patterns
		patterns_to_be_deleted = []
		for pattern in patterns: # passed in patterns
			pattern_query = deployer.patterns[pattern]
			if len(pattern_query) > 0:
				for p in pattern_query:
					if p not in excludes:
						patterns_to_be_deleted.append(p)
					else:
						print "Skipping pattern '%s'." % p.name
			else:
				print "Cannot find any patterns that match the search query '%s'." % pattern
		
		for pattern in patterns_to_be_deleted:
			if len(pattern.virtualsystems) < 1:
				pattern.delete()
				print "'%s' has been deleted!" % pattern.name
			else:
				print "Skipping pattern deletion for '%s' because %i virtual system %s associated with it." % (pattern.name, len(pattern.virtualsystems), "instances are" if len(pattern.virtualsystems) > 1 else "instance is")

		print "Pattern clean up completed."

if cleanupMethod == "cleanup_patterns":
	cleanup_patterns(patterns=resourceNames, excluded=excludedResources, patterns_older_than=resourceOlderThan)
elif cleanupMethod == "cleanup_scripts":
	cleanup_scripts = RemoveScripts(scripts=resourceNames, excluded=excludedResources, allScripts=deployer.scripts, allPatterns=deployer.patterns)
	cleanup_scripts.input()
elif cleanupMethod == "cleanup_images":
	cleanup_images = RemoveImages(images=resourceNames, excluded=excludedResources, allImages=deployer.virtualimages, allPatterns=deployer.patterns)
	cleanup_images.input()
