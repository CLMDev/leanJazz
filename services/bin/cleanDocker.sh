#!/bin/sh
. ./env.sh

echo "stopping my container"
$docker_cmd rm -f simpletopologyservice

echo "removing all running containers" 
$docker_cmd stop $(docker ps -a -q)     
$docker_cmd rm $(docker ps -a -q)

echo "removing docker images for simpletopologyservice" 
$docker_cmd rmi rjminsha/simpletopologyservicedev 
$docker_cmd rmi rjminsha/simpletopologyservice
$docker_cmd rmi rjminsha/base

echo "removing untagged docker images" 
$docker_cmd rmi $(docker images | grep "^<none>" | awk "{print $3}")

