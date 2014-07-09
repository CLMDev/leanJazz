#!/bin/sh
. ./env.sh

echo "Running tests from container" 
docker run --link simpletopologyservice:sts_alias rjminsha/simpletopologyservicetest /app/testLinkedContainer.sh 

