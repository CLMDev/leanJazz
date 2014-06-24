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
echo "PORT:$PORT"
echo "HOSTNAME:$HOSTNAME"
echo "DB_HOSTNAME:$DB_HOSTNAME"
echo "DB_PORT:$DB_PORT" 
echo "REMOVE-TEST-DATA:$REMOVE-TEST-DATA"
echo "DEFAULT_PROVIDER_URL:$DEFAULT_PROVIDER_URL"
echo "DEFAULT_PROVIDER_PASSWORD:$DEFAULT_PROVIDER_PASSWORD"
echo ""

echo "Starting Mongo DB" 
/usr/bin/mongod --dbpath /data/db &

echo "Starting node application"
cd /app
pwd 
node /app/app.js
