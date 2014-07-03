#!/bin/sh
. ./env.sh

#find the information about the running containers 
db_port=$(docker inspect --format='{{(index (index .NetworkSettings.Ports "27017/tcp") 0).HostPort}}' simpletopologyservice)
web_port=$(docker inspect --format='{{(index (index .NetworkSettings.Ports "3001/tcp") 0).HostPort}}' simpletopologyservice)

echo "public_host:$public_host" 
echo "mongo port: $db_port"
echo "web port:$web_port"

echo "Running tests from container" 
docker run --link simpletopologyservice:sts_alias rjminsha/test /app/testLinkedContainer.sh 

