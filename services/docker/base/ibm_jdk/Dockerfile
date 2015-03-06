FROM isuper/base-ubuntu
MAINTAINER Super Wang <xuepow@cn.ibm.com>

RUN mkdir -p /opt/ibm/java
ADD files/ibm-java-sdk-7.1-2.10-linux-x86_64.tgz /opt/ibm/java/
RUN echo 'export JAVA_HOME=/opt/ibm/java/ibm-java-x86_64-71' > /etc/profile.d/java.sh
RUN echo 'export JRE_HOME=/opt/ibm/java/ibm-java-x86_64-71/jre' >> /etc/profile.d/java.sh
RUN echo 'export PATH=${PATH}:${JAVA_HOME}/bin:${JRE_HOME}/bin' >> /etc/profile.d/java.sh

RUN update-alternatives --install "/usr/bin/java" "java" "/opt/ibm/java/ibm-java-x86_64-71/jre/bin/java" 1
RUN update-alternatives --install "/usr/bin/javaws" "javaws" "/opt/ibm/java/ibm-java-x86_64-71/jre/bin/javaws" 1
RUN update-alternatives --install "/usr/bin/javac" "javac" "/opt/ibm/java/ibm-java-x86_64-71/bin/javac" 1
RUN update-alternatives --set java /opt/ibm/java/ibm-java-x86_64-71/jre/bin/java
RUN update-alternatives --set javaws /opt/ibm/java/ibm-java-x86_64-71/jre/bin/javaws
RUN update-alternatives --set javac /opt/ibm/java/ibm-java-x86_64-71/bin/javac

RUN java -version
RUN javac -version
