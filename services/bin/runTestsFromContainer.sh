#!/bin/sh
. ./env.sh

#find the information about the running containers 
db_port=$(docker inspect --format='{{(index (index .NetworkSettings.Ports "27017/tcp") 0).HostPort}}' simpletopologyservice)
web_port=$(docker inspect --format='{{(index (index .NetworkSettings.Ports "3001/tcp") 0).HostPort}}' simpletopologyservice)

echo "public_host:$public_host" 
echo "mongo port: $db_port"
echo "web port:$web_port"

echo "Running tests from (non-linked) container" 
$docker_cmd run -e "WEB_PORT=49155" -e "WEB_HOSTNAME=192.168.59.103" -e "DB_PORT=49153" -e "DB_HOSTNAME=192.168.59.103" rjminsha/simpletopologyservicetest

