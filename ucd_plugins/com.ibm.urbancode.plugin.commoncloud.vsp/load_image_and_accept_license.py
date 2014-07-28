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

