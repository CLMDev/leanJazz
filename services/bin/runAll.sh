#!/bin/sh
. env.sh
$docker_cmd run -P -d --name=simpletopologyservice leanjazz/simpletopologyservice 

