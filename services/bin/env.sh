#!/bin/sh

docker_cmd="docker"
docker_ver=$(docker -v | sed 's/Docker version \+\(.*\),.*/\1/')

public_host=192.168.59.103
