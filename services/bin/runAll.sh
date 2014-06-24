#!/bin/sh
. env.sh

#run simple topology service with embeded mongodb
$docker_cmd run -P -d --name=simpletopologyservice --env DB_PORT=27017 --env DB_HOSTNAME=localhost leanjazz/simpletopologyservice 

#find the information about the running containers 
db_port=$(docker inspect --format='{{(index (index .NetworkSettings.Ports "27017/tcp") 0).HostPort}}' simpletopologyservice)
web_port=$(docker inspect --format='{{(index (index .NetworkSettings.Ports "3001/tcp") 0).HostPort}}' simpletopologyservice)

echo "public_host:$public_host" 
echo "mongo port: $db_port"
echo "web port:$web_port"

pushd . 
cd ../simpleTopologyService
env WEB_PORT=$web_port WEB_HOSTNAME=$public_host DB_PORT=$db_port DB_HOSTNAME=$public_host mocha --reporter spec
popd 

run the ip address of the running container 
 

