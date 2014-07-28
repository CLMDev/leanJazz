import sys

print 'loading virtual image'
print 'image name: image_name'
print 'image url: image_url'
print 'image version: image_version'
print 'image reference: image_reference'
image=deployer.virtualimages.create('image_url')
image
image.waitFor()
if (len(sys.argv)>1):
   image.acceptLicense()

