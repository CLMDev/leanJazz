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

echo "Printing out environment information for the application"
echo "WEB_PORT:$WEB_PORT"
echo "WEB_HOSTNAME:$WEB_HOSTNAME"
echo "DB_HOSTNAME:$DB_HOSTNAME"
echo "DB_PORT:$DB_PORT"

cd /app
pwd
dir 

echo "Running application" 

# env WEB_PORT=$web_port WEB_HOSTNAME=$public_host DB_PORT=$db_port DB_HOSTNAME=$public_host mocha --reporter spec
mocha --reporter spec

