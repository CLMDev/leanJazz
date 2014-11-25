<h1>Open Source Component of IBM DB2 Server</h1>

<h2>Overview</h2>
<p>All processes / scripts inside this component are basically for IBM DB2 Server only.<p>

<h2>Configurations</h2>

<h3>Environment Property Definitions</h3>
<p>The environment property definitions here are for users to configure the parameters to connect to IBM DB2 Server.<p>
<ul>
<li>
	<h4>DEFAULT_DB_ROOT_PASSWORD</h4>
	<p>The root password of IBM DB2 Server</p>
</li>
<li>
	<h4>DEFAULT_DB_ADMIN_USERNAME</h4>
	<p>The username of administrative user of IBM DB2 Server, default value is <li>db2inst1</li></p>
</li>
<li>
	<h4>DEFAULT_DB_ADMIN_PASSWORD</h4>
	<p>The password of administrative user of IBM DB2 Server</p>
</li>
<li>
	<h4>DEFAULT_DB_PORT</h4>
	<p>The port the IBM DB2 Server will be listen on, default value is <li>50001</li> for Linux instances</p>
</li>
<ul>

<h3>Processes</h3>
<ul>
<li>
	<h4>Install Database Administrative Scripts</h4>
	<p>This process is used to download and install the administrative scripts from uDeploy to your instance(s), and also design to verify existing IBM DB2 Server(not implemented yet), several variables like <strong>DB_TYPE</strong> / <strong>DB_HOSTNAME</strong> / <strong>DB_ROOT_PASSWORD</strong> / <strong>DB_ADMIN_USERNAME</strong> / <strong>DB_ADMIN_PASSWORD</strong> / <strong>DB_PORT</strong> will be registered to the environment.<p>
</li>
</ul>