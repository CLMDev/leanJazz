class RemoveImages:
	'''
	This script is to remove the unused images.

	It can be used by the following way:

	1.Delete the specific unused images
	IWD
	deployer -h hostname -u username -p password -f deleteUnusedImages [imagename1,imagename2,imagename3]
	IPAS
	pure -h hostname -u username -p password -f deleteUnusedImages [imagename1,imagename2,imagename3]

	It will check the images to see whether thay are existed and being used.
	If they are existed and not being used,they will be removed.

	
	2.Delete all unused images
	IWD
	deployer -h hostname -u username -p password -f deleteUnusedImages 
	IPAS
	pure -h hostname -u username -p password -f deleteUnusedImages 

	All unused images will be removed.
	'''
	
	import sys
	
	def __init__(self, images=[], excluded=[], allImages=[], allPatterns=[]):
		self.images = images
		self.excluded = excluded
		self.allImages = allImages
		self.allPatterns = allPatterns
		
		self.imageIds = []

	def input(self):
		# remove excluded images from all images
		self.excludes = []
		for v in self.allImages:
			for i in self.excluded:
				if i.lower() in v.name.lower():
					self.excludes.append(v)
		
		self.allImages = list(set(self.allImages) - set(self.excludes))
	
		if self.images:
			self.deleteImagesWithNames(self.images)
		else:
			self.deleteImagesWithoutNames()

	def deleteImagesWithNames(self, imageNames=[]):
                for s in self.allImages:
                        for i in self.images:
                                if i.lower() in s.name.lower():
                                        self.deleteScript(s)
                                        break


					
	def deleteImagesWithoutNames(self):
		print("deleting images without giving the names is not supported")
                return 1

	def deleteImage(self, image):
		print ('Try to remove the image', image.name)
		try:
			# image.delete()
			print ('The image is deleted ', image.name)
		except Exception, e:
			print ('The image could not be deleted', image.name)
