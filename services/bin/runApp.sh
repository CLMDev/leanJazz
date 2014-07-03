#!/bin/sh
. ./env.sh

#run simple topology service with embeded mongodb
echo "Running Simple Topology Service" 
$docker_cmd run -P -d --name=simpletopologyservice --env DB_PORT=27017 --env DB_HOSTNAME=localhost rjminsha/simpletopologyservice 


