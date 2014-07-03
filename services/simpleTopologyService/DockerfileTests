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
#   limitations under the License.FROM leanjazz/base
FROM rjminsha/base
MAINTAINER Robbie Minshall "rjminsha@us.ibm.com"

# Install MongoDB
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
RUN apt-get update

# Install Node.js (assumes ubuntu > 13 from the base image) 
RUN apt-get --purge remove node 
RUN apt-get --purge remove nodejs 
RUN apt-get install -y nodejs
RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10 
RUN apt-get install -y npm 

# Expose default port for Node 
EXPOSE  3001

# install node application 
Add . /app/

# Install app dependencies
RUN cd /app; npm install  
RUN cd /app; npm install -g mocha 

# Update runtests.sh to be executable 
RUN chmod +x /app/*.sh 

CMD ["/app/runtests.sh"] 

