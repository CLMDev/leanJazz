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
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y mongodb-org 

# or a specific version of Mongo 
# RUN  DEBIAN_FRONTEND=noninteractive apt-get install mongodb-org=2.6.1 mongodb-org-server=2.6.1 mongodb-org-shell=2.6.1 mongodb-org-mongos=2.6.1 mongodb-org-tools=2.6.1

# mount a data volume to MongoDB's data directory
VOLUME ["/data/db/"]

# TCP socket
EXPOSE 27017
# http interface
EXPOSE 28017

# Install Node.js (assumes ubuntu > 13 from the base image) 
RUN apt-get --purge remove node 
RUN apt-get --purge remove nodejs 
RUN apt-get install -y nodejs
RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10 
RUN apt-get install -y npm 

# Set default environment variables 
ENV WEB_PORT 3001
ENV DB_HOSTNAME localhost
ENV DB_PORT 27017 
ENV DEFAULT_PROVIDER_URL defaultProviderNotSet.mycompany.com
ENV DEFAULT_PROVIDER_USERNAME userNotSet
ENV DEFAULT_PROVIDER_PASSWORD passwordNotSet
	
# Expose default port for Node 
EXPOSE  3001

# install node application 
Add . /app/

#  configure supervisor to start services 
RUN mv /app/supervisor_config/* /etc/supervisor/conf.d/

# Install app dependencies
RUN cd /app; npm install  

RUN chmod +x /app/start.sh 

# standard command to be run
# While mongo and node are configured in supervisor that results in the logs being difficult
# to view without including SSH daemon on the instance.   
#CMD ["/usr/bin/supervisord", "-n"]
CMD ["/app/start.sh"] 

