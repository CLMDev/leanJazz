<h1>Open Source Component of IBM WebSphere Application Server</h1>

<h2>Overview</h2>
<p>All processes / scripts inside this component are basically for IBM WebSphere Application Server only.</p>

<h2>Configurations</h2>

<h3>Environment Property Definitions</h3>
<p>The environment property definitions here are for users to configure the parameters of LDAP which will be used to enable security settings of IBM WebSphere Application Server.</p>
<ul>
<li>
	<h4>ldap_host</h4>
	<p>Display as <strong>LDAP Hostname</strong>, the LDAP server host name. This host name is either an IP address or a domain name service (DNS) name.</p>
</li>
<li>
	<h4>ldap_port</h4>
	<p>Display as <strong>LDAP Port</strong>, the port the LDAP server will listen on, default value is <i>389</i></p>
</li>
<li>
	<h4>ldap_bindDN</h4>
	<p>Display as <strong>LDAP Bind Distinguished Name (DN)</strong>, the distinguished name for the application server, which is used to bind to the directory service. For example, <i>cn=root</i>.</p>
</li>
<li>
	<h4>ldap_bindPassword</h4>
	<p>Display as <strong>LDAP Bind Password</strong>, the password for the application server, which is used to bind to the directory service.</p>
</li>
<li>
	<h4>ldap_baseDN</h4>
	<p>Display as <strong>LDAP Base Distinguished Name (DN)</strong>, the base distinguished name of the directory service, which indicates the starting point for LDAP searches in the directory service. For example, <i>ou=Rochester, o=IBM, c=us</i>.</p>
</li>
<li>
	<h4>ldap_userIdMap</h4>
	<p>Display as <strong>LDAP User ID map</strong>, a LDAP filter that maps the short name of a user to an LDAP entry, default value is <i>uid</i></p>
</li>
<li>
	<h4>ldap_userFilter</h4>
	<p>Display as <strong>LDAP User Filter</strong>, a LDAP filter clause for searching the user registry for users, default value is <i>"(&(uid=%v)(objectclass=inetOrgPerson))"</i></p>
</li>
<li>
	<h4>ldap_groupIdMap</h4>
	<p>Display as <strong>LDAP Group ID map</strong>, a LDAP filter that maps the short name of a group to an LDAP entry, default value is <i>cn*</p>
</li>
<li>
	<h4>ldap_groupFilter</h4>
	<p>Display as <strong>LDAP Group Filter</strong>, a LDAP filter clause for searching the user registry for groups, default value is <i>"(&(cn=%v)(objectclass=groupOfUniqueNames))"</i></p>
</li>
<li>
	<h4>ldap_groupMemberIdMap</h4>
	<p>Display as <strong>LDAP Group Member ID map</strong>, a LDAP filter that identifies user to group memberships, default value is <i>uniqueMember</i></p>
</li>
<li>
	<h4>ldap_primaryid</h4>
	<p>Display as <strong>WAS Admin User ID</strong>, the user ID of WAS Administrative User in LDAP directory</p>
</li>
<li>
	<h4>ldap_primaryid_Password</h4>
	<p>Display as <strong>WAS Admin User Password</strong>, the password of WAS Administrative User in LDAP directory</p>
</li>
<li>
	<h4>ldap_sslEnabled</h4>
	<p>Display as <strong>LDAP with SSL</strong>, whether secure socket communications is enabled with the LDAP server. When this option is set to true, LDAP SSL settings are used, default value is <i>false</i></p>
</li>
</ul>

<h3>Processes</h3>
<ul>
<li>
	<h4>Install WAS Administrative Scripts</h4>
	<p>This process is used to download and install the administrative scripts from uDeploy to your instance(s), and also design to verify existing IBM WebSphere Application Server(not implemented yet), several variables like <strong>WAS_SYS_USERNAME</strong> / <strong>WAS_PROFILE_ROOT</strong> / <strong>WAS_SERVER_NAME</strong> will be registered to the agent properties.</p>
</li>
<li>
	<h4>Configure WAS Common and Security</h4>
	<p>This process will help you to enable security settings of IBM WebSphere Application Server, several variables like <strong>WAS_ADMIN_USERNAME</strong> / <strong>WAS_ADMIN_PASSWPRD</strong> will be registered to the agent properties.</p>
</li>
<li>
	<h4>Restart WAS</h4>
	<p>This process will help you to restart the IBM WebSphere Application Server.</p>
</li>
<li>
	<h4>Start WAS</h4>
	<p>This process will help you to start the IBM WebSphere Application Server.</p>
</li>
<li>
	<h4>Stop WAS</h4>
	<p>This process will help you to stop the IBM WebSphere Application Server.</p>
</li>
</ul>
	