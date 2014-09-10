# Open Source Component of Rational Automation Preparation

## Overview
All processes / scripts inside this component are basically for Rational Automation Preparation.

## Configurations

### Environment Property Definitions
The environment property definitions here are for users to configure the parameters of LDAP which will be used to enable security settings of IBM WebSphere Application Server.

* NTP_SERVER
Display as **NTP Server**, the time server for the instance(s) to sync their time, default value is *0.rhel.pool.ntp.org*.


### Processes

* Prepare machine to run UCD
This process is designed to prepare the instance(s) for automation, typically upgrade OS, tune some common settings like NTP etc.

* Configure Firewall
This process will help to configure the firewall settings, for now, it just disable the firewall.
