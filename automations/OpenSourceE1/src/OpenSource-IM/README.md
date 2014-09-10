# Open Source Component of IBM Installation Manager

## Overview
All processes / scripts inside this component are basically for IBM Installation Manager only.

## Configurations

### Environment Property Definitions
The environment property definitions here are for users to configure the repository for upgrade existing IBM Installation Manager to a higher version.

* IM_REPO
You can leave **IM_REPO** empty(the default value) if your instance(s) have public network access and able to visit IBM service repository, use it if you want to upgrade IBM Installation Manager to the latest version.
You can also setup your own repository if you want to upgrade to a specified version, please read instructions from [IBM Support Portal](http://www-01.ibm.com/support/docview.wss?uid=swg24037254) and download the latest update package(with **Update** in the name, like *1.7.3.0-IBMIM-Multiplatform-Update-20140521_1925*) from Fix Central.
You will receive a zip file, extract the content into a folder under your web server's document root like */var/www/example.com/im_update*, then you will be possible to access http://www.example.com/im_update/repository.config, use this full URL as the value.

* IM_REPO_USERNAME
If your repository is secured with user authentication mechanism, you need to specify the username who has the access right here, leave it empty(the default value) if you leave IM_REPO empty or your own repository don't have such mechanism.

* IM_REPO_PASSWORD
This is the password of the user account which you are going to use to access the repository, must be provided if IM_REPO_USERNAME is provided.

* IM_MASTER_PASSWORD
The master password which will be used for IBM Installation Manager secure store, must be provided if IM_REPO_USERNAME and IM_REPO_PASSWORD be provided, you can find more information about it from the information center.


### Processes

* Install IBM IM Administrative Scripts
This process is used to download and install the administrative scripts from uDeploy to your instance(s), and also design to verify existing IBM Installation Manager(not implemented yet), variable **IM_HOME** will be registered to the environment.
If you IBM Installation Manager is not installed in the default folder /opt/IBM/InstallationManager, you can change it in the Component Process Properties in uDeploy.

* Upgrade Existing IBM IM
This process will do the upgrade of IBM Installation Manager by using the repository and credential you specified in Environment Property Definitions.

