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
class RemoveScripts:
	'''
	This script is to remove the unused scripts.

	It can be used by the following way:

	1.Remove unused scripts with specific names
	IWD
	deployer -h hostname -u username -p password -f removeUnusedScripts [scriptname1,scriptname2,scriptname3]
	IPAS
	pure -h hostname -u username -p password -f removeUnusedScripts [scriptname1,scriptname2,scriptname3]

	It will check the scripts to see whether thay are existed and being used.
	If they are existed and not being used,they will be removed.

	
	2.Remove all unused scripts
	IWD
	deployer -h hostname -u username -p password -f removeUnusedScripts 
	IPAS
	pure -h hostname -u username -p password -f removeUnusedScripts 

	All unused scripts will be removed.
	'''
	
	import sys
	
	def __init__(self, scripts=[], excluded=[], allScripts=[], allPatterns=[]):
		self.scripts = scripts
		self.excluded = excluded
		self.allScripts = allScripts
		self.allPatterns = allPatterns
		

	def input(self):
		# remove excluded scripts from all scripts
		self.excludes = []
		for s in self.allScripts:
			for i in self.excluded:
				if i.lower() in s.name.lower():
					self.excludes.append(s)
		
		self.allScripts = list(set(self.allScripts) - set(self.excludes))
		
		if self.scripts:
			self.deleteScriptsWithNames(self.scripts)
		else:
			self.deleteScriptsWithoutNames()

	def deleteScriptsWithNames(self, scriptNames=[]):
                for s in self.allScripts:
                        for i in scriptNames:
                                if i.lower() in s.name.lower():
                                        self.deleteScript(s)
                                        break

	def deleteScriptsWithoutNames(self):
                 print "deleting all unused scripts is not supported at this time"
                 return

	def deleteScript(self, script):
		print ('Try to remove the script', script.name)
		try:
			script.delete()
			print ('The script is deleted ', script.name)
		except Exception, e:
			print ('The script could not be deleted', script.name)

