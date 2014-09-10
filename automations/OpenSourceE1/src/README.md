<h1>Open Source Application of CLM E1 Distributed</h1>

<h2>Overview</h2>
<p>This IBM UrbanCode uDeloy application is designed to help user deploy CLM applications into a distributed cloud environment which can be provided by IBM Workload Deployer or IBM Pure Application System.</p>
<p>The E1 topology is a distributed topology of CLM, which has 1 IHS node works as a reverse proxy server, 1 database node, typically 1 JTS node + 1 CCM node + 1 QM node + 1 RM node, but we also support 1 JTS node + n CCM nodes +  n QM nodes + n RM nodes.</p>

<h2>Components</h2>
<p>You can navigate to sub-folders to see details of each component.</p>
<ul>
<li>
	<h4>OpenSource-RationalAutomationPrep</h4>
	<p>This component is design for Rational Automation Preparation, need to map to all resources.</p>
</li>
<li>
	<h4>OpenSource-DB2</h4>
	<p>This component is design for IBM DB2 Server, need to map to the resource(s) which has IBM DB2 Server on it, normally only one.</p>
</li>
<li>
	<h4>OpenSource-IHS</h4>
	<p>This component is design for IBM HTTP Server, need to map to the resource(s) which has IBM HTTP Server on it, normally only one.</p>
</li>
<li>
	<h4>OpenSource-WAS</h4>
	<p>This component is design for IBM WebSphere Application Server, need to map to the resource(s) which has IBM WebSphere Application Server on it.</p>
</li>
<li>
	<h4>OpenSource-IM</h4>
	<p>This component is design for IBM Installation Manager, need to map to the resource(s) which has IBM Installation Manager on it.</p>
</li>
<li>
	<h4>OpenSource-JTS / OpenSource-CCM / OpenSource-QM / OpenSource-RM</h4>
	<p>These are the components for CLM applications, map to the resource(s) which you want to have the application install on. We only support one JTS node in one single application, so just map OpenSource-JTS to one resource, and you can map the rest to several resources.</p>
</li>
<ul>

<h3>Processes</h3>
<ul>
<li>
	<h4>Deploy CLM to E1 Distributed Environment</h4>
	<p>This process is used deploy CLM to E1 Distributed environment.</p>
</li>
<li>
	<h4>Grant access to user in IWD</h4>
	<p>This process is used to grant access permission of the instance(s) in IWD to a specified user.</p>
</li>
<ul>

<h3>How to use</h3>
<ol>
<li>
	<h4>Prepare the cloud environment</h4>
	<p>To reduce the time to deploy basic environment like setup virtual machines, install middle-wares WAS / IHS / DB2, user can use the Virtual System Pattern provided by us, import it into IWD or IPAS.</p>
	<p>After that, you will get a VSP called <strong>Open Source - 6 Nodes Base Topology</strong> with 1 IHS node + 4 WAS nodes + 1 DB2 node, and another VSP called <strong>Open Source - 8 Nodes Base Topology</strong> with 1 IHS node + 6 WAS nodes + 1 DB2 node.</p>
</li>
<li>
	<h4>Import Application with Snapshot</h4>
	<p>Go to <strong>Applications</strong> in IBM UrbanCode uDeploy, click <strong>Import Applications</strong> button, check <strong>Import With Snapshot(s)</strong> and pick up the dist/UCD/20140807_artifacts.zip, you will get an application named <strong>Open Source - CLM E1 Distributed</strong> after import.</p>
</li>
<li>
	<h4>Setup Cloud Connections and Create Resource Template(s)</h4>
	<p>You need to connect your IBM UCD Server to the cloud provider like IWD / IPAS before you can deploy something into it. Go to <strong>Resources</strong> -> <strong>Cloud Connections</strong> and fill the parameters and credentials.</p>
	<p>Then you will be able to create resource templates from <strong>Resources</strong> -> <strong>Resource Templates</strong> -> <strong>Import Template from Cloud</strong>.</p>
	<p>You can create two resource templates based on the two Virtual System Patterns.</p>
</li>
<li>
	<h4>Design Blueprints</h4>
	<p>Go to <strong>Applications</strong>, find <strong>Open Source - CLM E1 Distributed</strong> and go into it, switch to <strong>Blueprints</strong> tab, click <strong>Create New Blueprints</strong> and select the resource template you just created.</p>
	<p>Blueprint is basically a mapping relationship between UCD components and resources, it tells UCD Server which component need to be deployed on which resource, in our case one resource represent one virtual machine.</p>
	<p>If you read the previous Components section carefully, you will know which component should be map to which resource.</p>
	<p>
		For example:
		<ul>
		<li>Map OpenSource-RationalAutomationPrep / OpenSource-DB2 to db2_awse</li>
		<li>Map OpenSource-RationalAutomationPrep / OpenSource-IHS to ibm_http_servers</li>
		<li>Map OpenSource-RationalAutomationPrep / OpenSource-WAS / OpenSource-IM / OpenSource-JTS to standalone_server</li>
		<li>Map OpenSource-RationalAutomationPrep / OpenSource-WAS / OpenSource-IM / OpenSource-CCM to standalone_server_0</li>
		<li>Map OpenSource-RationalAutomationPrep / OpenSource-WAS / OpenSource-IM / OpenSource-QM to standalone_server_0_1</li>
		<li>Map OpenSource-RationalAutomationPrep / OpenSource-WAS / OpenSource-IM / OpenSource-RM to standalone_server_0_1_2</li>
		</ul>
	</p>
</li>
<li>
	<h4>Create environment and configure properties for deployment</h4>
	<p>After the Blueprint is ready, you can switch to <strong>Environments</strong> tab inside application <strong>Open Source - CLM E1 Distributed</strong>, click <strong>Create New Environment</strong> button, give it a name and pick up the Blueprint, after a while you will get a new environment, you can go to IWD / IPAS to checkout the detailed process.</p>
	<p>When you have the environment(no need to wait all VMs been deployed), go into the environment, switch to <strong>Configuration</strong> tab, click <strong>Environment Properties</strong>, under <strong>Component Environment Properties</strong> you will see lots of properties, some of them are waiting your input. Go checkout the README.md file inside every component for the meanings, make sure you understand it before fill or change it.</p>
	<p>Click <strong>Save</strong> button after you finished.</p>
</li>
<li>
	<h4>Deploy CLM</h4>
	<p>It will be very easy to deploy CLM to your environment, wait until all virtual machines are in running status, go back to <strong>Environments</strong> tab inside application <strong>Open Source - CLM E1 Distributed</strong>, click the button with a play mark to request process, select <strong>Deploy CLM to E1 Distributed Environment</strong>, pickup the only Snapshot for now named <strong>20140807</strong>, then <strong>Submit</strong>.</p>
	<p>If you failed for some reason, you can re-submit your request again, just remember to un-check <strong>Only Changed Versions</strong>.</p>
</li>
</ol>
  