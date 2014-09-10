<h1>Open Source Component of Rational Automation Preparation</h1>

<h2>Overview</h2>
<p>All processes / scripts inside this component are basically for Rational Automation Preparation.</p>

<h2>Configurations</h2>

<h3>Environment Property Definitions</h3>
<p>The environment property definitions here are for users to configure the parameters of LDAP which will be used to enable security settings of IBM WebSphere Application Server.</p>
<ul>
<li>
	<h4>NTP_SERVER</h4>
	<p>Display as <strong>NTP Server</strong>, the time server for the instance(s) to sync their time, default value is <li>0.rhel.pool.ntp.org</li>.</p>
</li>
</ul>

<h3>Processes</h3>
<ul>
<li>
	<h4>Prepare machine to run UCD</h4>
	<p>This process is designed to prepare the instance(s) for automation, typically upgrade OS, tune some common settings like NTP etc.</p>
</li>
<li>
	<h4>Configure Firewall</h4>
	<p>This process will help to configure the firewall settings, for now, it just disable the firewall.</p>
</li>
</ul>
