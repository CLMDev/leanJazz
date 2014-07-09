#!/bin/sh

#  Copyright 2014 IBM
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

env 

echo "Printing out environment information for the application"
echo "WEB_PORT:$STS_ALIAS_PORT_3001_TCP_PORT"
echo "WEB_HOSTNAME:$STS_ALIAS_PORT_3001_TCP_ADDR"
echo "DB_HOSTNAME:$STS_ALIAS_PORT_27017_TCP_ADDR"
echo "DB_PORT:$STS_ALIAS_PORT_27017_TCP_PORT"

cd /app
pwd
dir 

echo "Running basic curl" 
curl --max-time 10 http://sts_alias:$STS_ALIAS_PORT_3001_TCP_PORT/topology/topologies

echo "Running full test suite" 
env WEB_PORT=$STS_ALIAS_PORT_3001_TCP_PORT WEB_HOSTNAME=$STS_ALIAS_PORT_3001_TCP_ADDR DB_PORT=$STS_ALIAS_PORT_27017_TCP_PORT DB_HOSTNAME=$STS_ALIAS_PORT_27017_TCP_ADDR mocha --reporter spec

