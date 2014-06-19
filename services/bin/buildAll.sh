#!/bin/sh

. ./env.sh
chmod +x *.sh

# build my base docker image 
pushd . 
cd ../base
$docker_cmd build -t leanjazz/base .
popd 

# build my simpleTopologyService docker image 
pushd . 
cd ../simpleTopologyService
$docker_cmd build -t leanjazz/simpletopologyservice .
popd .

# build my simpleTopologyService docker image 
pushd . 
cd ../simpleTopologyServiceDev
$docker_cmd build -t leanjazz/simpletopologyservicedev .
popd .
