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

FROM rjminsha/simpletopologyservice

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get -y install \
    openssh-server \
    wget &&\
  apt-get clean

# SSH
RUN mkdir -p /var/run/sshd
RUN echo 'root:password' | chpasswd
ADD sshd.conf /etc/supervisor/conf.d/sshd.conf

ADD id_rsa.pub /root/.ssh/id_rsa.pub
RUN cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys

RUN sed -i 's/session \+required \+pam_loginuid\.so/session    optional     pam_loginuid.so/' /etc/pam.d/sshd

EXPOSE 22

CMD ["/usr/bin/supervisord", "-n"]