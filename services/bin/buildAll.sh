#!/bin/sh

. ./env.sh
chmod +x *.sh

# build my base docker image 
echo "###################"
echo "building base image"
echo "###################"
pushd . 
cd ../base
$docker_cmd build -t leanjazz/base .
popd 

echo "###################"
echo "building simpletopologyservice image"
echo "###################"
# build my simpleTopologyService docker image 
pushd . 
cd ../simpleTopologyService
$docker_cmd build -t leanjazz/simpletopologyservice .
popd .

echo "###################"
echo "building dev image"
echo "###################"
# build my simpleTopologyService docker image 
pushd . 
cd ../simpleTopologyServiceDev
$docker_cmd build -t leanjazz/simpletopologyservicedev .
popd .
