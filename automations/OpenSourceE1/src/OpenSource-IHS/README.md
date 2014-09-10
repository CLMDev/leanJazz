<h1>Open Source Component of IBM HTTP Server<h1>

<h2>Overview</h2>
<p>All processes / scripts inside this component are basically for IBM HTTP Server only.</p>

<h2>Configurations</h2>

<h3>Environment Property Definitions</h3>
<p>The environment property definitions here are for users to configure the parameters used by IBM HTTP Server.</p>
<ul>
<li>
	<h4>IHS_ROOT_PASSWORD</h4>
	<p>The root password of IBM HTTP Server<p>
</li>
<li>
	<h4>IHS_HOME</h4>
	<p>The home directory of IBM HTTP Server, default value is <i>/opt/IBM/HTTPServer</i></p>
</li>
<li>
	<h4>IHS_WEB_PORT</h4>
	<p>The HTTP port that IBM HTTP Server will be listen on, default value is <i>80</i></p>
</li>
<li>
	<h4>IHS_HTTPS_PORT</h4>
	<p>The HTTPS port that IBM HTTP Server will be listen on, default value is <i>9443</i></p>
</li>
<li>
	<h4>IHS_KEYSTORE_PASSWORD</h4>
	<p>The password of IBM HTTP Server key store database<p>
</li>
<li>
	<h4>IHS_ADMIN_PORT</h4>
	<p>The port that IBM HTTP Admin Server will be listen on, default value is <i>8008</i></p>
</li>
<li>
	<h4>IHS_ADMIN_USERNAME</h4>
	<p>The username of administrative user of IBM HTTP Server, default value is <i>clmadmin</i></p>
</li>
<li>
	<h4>IHS_ADMIN_PASSWORD</h4>
	<p>The password of administrative user of IBM HTTP Server</p>
</li>
<li>
	<h4>IHS_PLUGINS_HOME</h4>
	<p>The home directory of IBM HTTP Server Plugins, default value is <i>/opt/IBM/Plugins</i></p>
</li>
</ul>

<h3>Processes</h3>
<ul>
<li>
	<h4>Install IHS Configuration Scripts</h4>
	<p>This process is used to download and install the administrative scripts from uDeploy to your instance(s), and also design to verify existing IBM HTTP Server(not implemented yet), several variables like <strong>IHS_HOSTNAME</strong> / <strong>IHS_ROOT_PASSWORD</strong> / <strong>IHS_HOME</strong> / <strong>IHS_WEB_PORT</strong> / <strong>IHS_ADMIN_PORT</strong> / <strong>IHS_ADMIN_USERNAME</strong> / <strong>IHS_ADMIN_PASSWORD</strong> / <strong>IHS_PLUGINS_HOME</strong> will be registered to the environment.</p>
</li>
<li>
	<h4>Configure IHS Plugins for WAS Nodes</h4>
	<p>This process will help you to enable SSL of IBM HTTP Server and configure it with IBM HTTP Server Plugins with a blank configuration file, not map to WebSphere Application Server(s) yet.</p>
</li>
<li>
	<h4>Restart IHS</h4>
	<p>This process will help you to restart the IBM HTTP Server</p>
</li>
</ul>
