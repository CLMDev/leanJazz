# Open Source Application of CLM E1 Distributed

## Overview
This IBM UrbanCode uDeloy application is designed to help user deploy CLM applications into a distributed cloud environment which can be provided by IBM Workload Deployer or IBM Pure Application System.

The E1 topology is a distributed topology of CLM, which has 1 IHS node works as a reverse proxy server, 1 database node, typically 1 JTS node + 1 CCM node + 1 QM node + 1 RM node, but we also support 1 JTS node + n CCM nodes +  n QM nodes + n RM nodes.


## Components

You can navigate to sub-folders to see details of each component.

* OpenSource-RationalAutomationPrep
This component is design for Rational Automation Preparation, need to map to all resources.

* OpenSource-DB2
This component is design for IBM DB2 Server, need to map to the resource(s) which has IBM DB2 Server on it, normally only one.

* OpenSource-IHS
This component is design for IBM HTTP Server, need to map to the resource(s) which has IBM HTTP Server on it, normally only one.

* OpenSource-WAS
This component is design for IBM WebSphere Application Server, need to map to the resource(s) which has IBM WebSphere Application Server on it.

* OpenSource-IM
This component is design for IBM Installation Manager, need to map to the resource(s) which has IBM Installation Manager on it.

* OpenSource-JTS / OpenSource-CCM / OpenSource-QM / OpenSource-RM
These are the components for CLM applications, map to the resource(s) which you want to have the application install on. We only support one JTS node in one single application, so just map OpenSource-JTS to one resource, and you can map the rest to several resources.


## Processes

* Deploy CLM to E1 Distributed Environment
This process is used deploy CLM to E1 Distributed environment.

* Grant access to user in IWD
This process is used to grant access permission of the instance(s) in IWD to a specified user.


## How to use

1. Prepare the cloud environment

To reduce the time to deploy basic environment like setup virtual machines, install middle-wares WAS / IHS / DB2, user can use the Virtual System Pattern provided by us, import it into IWD or IPAS.

After that, you will get a VSP called **Open Source - 6 Nodes Base Topology** with 1 IHS node + 4 WAS nodes + 1 DB2 node, and another VSP called **Open Source - 8 Nodes Base Topology** with 1 IHS node + 6 WAS nodes + 1 DB2 node.

2. Import Application with Snapshot

Go to **Applications** in IBM UrbanCode uDeploy, click **Import Applications** button, check **Import With Snapshot(s)** and pick up the dist/UCD/20140807_artifacts.zip, you will get an application named **Open Source - CLM E1 Distributed** after import.

3. Setup Cloud Connections and Create Resource Template(s)

You need to connect your IBM UCD Server to the cloud provider like IWD / IPAS before you can deploy something into it. Go to **Resources** -> **Cloud Connections** and fill the parameters and credentials.

Then you will be able to create resource templates from **Resources** -> **Resource Templates** -> **Import Template from Cloud**.

You can create two resource templates based on the two Virtual System Patterns.

4. Design Blueprints 

Go to **Applications**, find **Open Source - CLM E1 Distributed** and go into it, switch to **Blueprints** tab, click **Create New Blueprints** and select the resource template you just created.

Blueprint is basically a mapping relationship between UCD components and resources, it tells UCD Server which component need to be deployed on which resource, in our case one resource represent one virtual machine.

If you read the previous Components section carefully, you will know which component should be map to which resource.

For example:

* db2_awse
OpenSource-RationalAutomationPrep / OpenSource-DB2

* ibm_http_servers
OpenSource-RationalAutomationPrep / OpenSource-IHS

* standalone_server
OpenSource-RationalAutomationPrep / OpenSource-WAS / OpenSource-IM / OpenSource-JTS

* standalone_server_0
OpenSource-RationalAutomationPrep / OpenSource-WAS / OpenSource-IM / OpenSource-CCM

* standalone_server_0_1
OpenSource-RationalAutomationPrep / OpenSource-WAS / OpenSource-IM / OpenSource-QM

* standalone_server_0_1_2
OpenSource-RationalAutomationPrep / OpenSource-WAS / OpenSource-IM / OpenSource-RM

5. Create environment and configure properties for deployment

After the Blueprint is ready, you can switch to **Environments** tab inside application **Open Source - CLM E1 Distributed**, click **Create New Environment** button, give it a name and pick up the Blueprint, after a while you will get a new environment, you can go to IWD / IPAS to checkout the detailed process.

When you have the environment(no need to wait all VMs been deployed), go into the environment, switch to **Configuration** tab, click **Environment Properties**, under **Component Environment Properties** you will see lots of properties, some of them are waiting your input. Go checkout the README.md file inside every component for the meanings, make sure you understand it before fill or change it.

Click **Save** button after you finished.

6. Deploy CLM

It will be very easy to deploy CLM to your environment, wait until all virtual machines are in running status, go back to **Environments** tab inside application **Open Source - CLM E1 Distributed**, click the button with a play mark to request process, select **Deploy CLM to E1 Distributed Environment**, pickup the only Snapshot for now named **20140807**, then **Submit**.

If you failed for some reason, you can re-submit your request again, just remember to un-check **Only Changed Versions**.
