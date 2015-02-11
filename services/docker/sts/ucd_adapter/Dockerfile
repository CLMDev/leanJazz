FROM base/wlp
MAINTAINER Super Wang <xuepow@cn.ibm.com>

COPY files/defaultServer /opt/ibm/wlp/usr/servers/defaultServer

EXPOSE 9080 9443

CMD /opt/ibm/wlp/bin/server start && tail -f /opt/ibm/wlp/usr/servers/defaultServer/logs/console.log
