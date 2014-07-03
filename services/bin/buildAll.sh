#!/bin/sh

. ./env.sh
chmod +x *.sh

# build my base docker image 
echo "###################"
echo "building base image"
echo "###################"
pushd . 
cd ../base
$docker_cmd build -t rjminsha/base .
popd 

echo "###################"
echo "building simpletopologyservice image"
echo "###################"
# build my simpleTopologyService docker image 
pushd . 
cd ../simpleTopologyService
rm -f Dockerfile 
cp DockerfileApp Dockerfile 
$docker_cmd build -t rjminsha/simpletopologyservice .
popd .

echo "###################"
echo "building simpletopologyservice test image"
echo "###################"
# build my simpleTopologyService docker image 
pushd . 
cd ../simpleTopologyService
rm -f Dockerfile 
cp DockerfileTests Dockerfile 
$docker_cmd build -t rjminsha/simpletopologyservicetest .
popd .

echo "###################"
echo "building dev image"
echo "###################"
# build my simpleTopologyService docker image 
pushd . 
cd ../simpleTopologyServiceDev
$docker_cmd build -t rjminsha/simpletopologyservicedev .
popd .
