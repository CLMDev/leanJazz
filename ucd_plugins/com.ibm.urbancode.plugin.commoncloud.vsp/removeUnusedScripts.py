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

