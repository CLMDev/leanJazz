#!/bin/sh

docker_cmd="docker"
docker_ver=$(docker -v | sed 's/Docker version \+\(.*\),.*/\1/')
