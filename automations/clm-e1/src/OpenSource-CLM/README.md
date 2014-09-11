<h1>Open Source Component of IBM Collaborative Lifecycle Management (JTS / CCM / QM / RM)</h1>

<h2>Overview</h2>
<p>All processes / scripts inside this component are basically for IBM Collaborative Lifecycle Management related applications, including JTS, CCM, QM and RM.</p>
<p>The tricky part is that component OpenSource-JTS, OpenSource-CCM, OpenSource-QM and OpenSource-RM will share the same source code here, we defined theses four separate components in uDeploy for better understanding, if they want to install CCM application on one node, they just need to map the OpenSource-CCM component to that node.</p>

<h2>Configurations</h2>

<h3>Environment Property Definitions</h3>
<p>The environment property definitions here are for users to configure the parameters of LDAP which will be used to enable security settings of IBM WebSphere Application Server.</p>
<ul>
<li>
	<h4>CLM_REPO</h4>
	<p>The software repository that will be used to install CLM related applications the default value is <i>https://jazz.net/downloads/clm/5.0/5.0/install-repository/clm-offerings/repository/repository.config<i>, it's a repository on <a title="jazz.net" href="http://jazz.net">http://jazz.net</a>, if your instances can access the public Internet, you can use this repository directly.</p>
</li>
<li>
	<h4>CLM_REPO_USERNAME</h4>
	<p>If your repository is secured with user authentication mechanism, you need to specify the username who has the access right here, DO provide your <a title="jazz.net" href="http://jazz.net">jazz.net</a> id if your didn't change the value of CLM_REPO, and leave it empty(the default value) if your own repository don't have such mechanism.</p>
</li>
<li>
	<h4>CLM_REPO_PASSWORD</h4>
	<p>This is the password of the user account which you are going to use to access the repository, must be provided if CLM_REPO_USERNAME is provided</p>
</li>
<li>
	<h4>CLM_MASTER_PASSWORD</h4>
	<p>The master password which will be used for IBM Installation Manager secure store, must be provided if CLM_REPO_USERNAME and CLM_REPO_PASSWORD is provided, you can find more information about it from the information center.</p>
</li>
<li>
	<h4>ldap_host</h4>
	Display as <strong>LDAP Hostname</strong>, the LDAP server host name. This host name is either an IP address or a domain name service (DNS) name.</p>
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
	<h4>jazz_ldap_userAttributesMapping</h4>
	<p>Display as <strong>User Property Names Mapping</strong>, the mapping of Jazz user property names to LDAP registry entry attribute names. The mapping should be represented as {contributorAttributeName1}={LDAPEntryAttributeName1}, {contributorAttributeName2}={LDAPEntryAttributeName2}..., default value is <i>"userId=uid,name=cn,emailAddress=mail"</i></p>
</li>
<li>
	<h4>jazz_ldap_groupMapping</h4>
	<p>Display as <strong>Jazz to LDAP Group Mapping</strong>, the mapping between Jazz groups and LDAP groups. One Jazz group can be mapped to multiple LDAP groups. The LDAP groups must be separated by a semi colon. For example, <i>JazzAdmins=LDAPAdmins1;LDAPAdmins2,JazzUsers=LDAPUsers1;LDAPUsers2</i> maps JazzAdmins group to LDAPAdmins1 and LDAPAdmins2, and maps JazzUsers group to LDAPUsers1 and LDAPUsers2.</p>
</li>
<li>
	<h4>jazz_grouprole_JazzAdmins</h4>
	<p>Display as <strong>Jazz LDAP Group for Jazz Admins</strong>, the distinguished name for the LDAP group which will be used as Jazz Admins. For example, <i>cn=JazzAdmins,dc=domain</i>.</p>
</li>
<li>
	<h4>jazz_grouprole_JazzDWAdmins</h4>
	<p>Display as <strong>Jazz LDAP Group for Jazz Data Warehouse Admins</strong>, the distinguished name for the LDAP group which will be used as Jazz Data Warehouse Admins. For example, <i>cn=JazzDWAdmins,dc=domain</i>.</p>
</li>
<li>
	<h4>jazz_grouprole_JazzUsers</h4>
	<p>Display as <strong>Jazz LDAP Group for Jazz Users</strong>, the distinguished name for the LDAP group which will be used as Jazz Users. For example, <i>cn=JazzUsers,dc=domain</i>.</p>
</li>
<li>
	<h4>jazz_grouprole_JazzGuests</h4>
	<p>Display as <strong>Jazz LDAP Group for Jazz Guests</strong>, the distinguished name for the LDAP group which will be used as Jazz Guests. For example, <i>cn=JazzGuests,dc=domain</i>.</p>
</li>
<li>
	<h4>jazz_grouprole_JazzProjectAdmins</h4>
	<p>Display as <strong>Jazz LDAP Group for Jazz Project Admins</strong>,, the distinguished name for the LDAP group which will be used as Jazz Project Admins. For example, <i>cn=JazzProjectAdmins,dc=domain</i>.</p>
</li>
<li>
	<h4>jazz_ldap_primaryid</h4>
	<p>Display as <strong>Jazz Admin Username</strong>, The username of Jazz administrative user in LDAP directory service, default value is <i>clmadmin</i>.</p>
</li>
<li>
	<h4>jazz_ldap_primaryid_Password</h4>
	<p>Display as <strong>Jazz Admin User Password</strong>, The password of Jazz administrative user in LDAP directory service.</p>
</li>
<li>
	<h4>ldap_groupIdMap</h4>
	<p>Display as <strong>LDAP Group ID map</strong>, a LDAP filter that maps the short name of a group to an LDAP entry, default value is <i>cn</i></p>
</li>
<li>
	<h4>ldap_groupMemberIdMap</h4>
	<p>Display as <strong>LDAP Group Member ID map</strong>, a LDAP filter that identifies user to group memberships, default value is <i>uniqueMember</i></p>
</li>
<li>
	<h4>NTP_SERVER</h4>
	<p>Display as <strong>NTP Server</strong>, the time server for the CLM application(s) to sync their time, default value is <i>0.rhel.pool.ntp.org</i>.</p>
</li>
</ul>

<h3>Processes</h3>
<ul>
<li>
	<h4>Init Component Nodes Registration</h4>
	<p>This process will create a environment property called <strong>CCM_NODES</strong> or <strong>QM_NODES<strong/> or <strong>RM_NODES</strong> based on which component you are running against.</p>
</li>
<li>
	<h4>Compute Context and Register Component Node</h4>
	<p>This process will attach the hostname to the environment property created in process <strong>Init Component Nodes Registration</strong>, count how many existing hostnames has been registered, save application context like ccm02 to an agent property <i>CONTEXT</i>.</p>
</li>
<li>
	<h4>Install CLM Component</h4>
	<p>This process will install CLM component using IBM Installation Manager with application context and register <strong>JAZZ_HOME</strong> to agent properties.</p>
</li>
<li>
	<h4>Create DB and Schema remotely</h4>
	<p>This process will create the database and schema needed by CLM applications, and register the database connection string(s) to environment properties.</p>
</li>
<li>
	<h4>Create web server and configure IHS Plugin remotely</h4>
	<p>This process will create web server definition in WAS, configure IHS and Plugins to map specified URL to WAS.</p>
</li>
<li>
	<h4>Tune WAS</h4>
	<p>This process will tune WAS, like configure the necessary JVM properties for CLM application(s).</p>
</li>
<li>
	<h4>Deploy CLM Web Applications</h4>
	<p>This process will deploy the CLM web application(s) to the WAS and configure JAAS.</p>
</li>
<li>
	<h4>Setup CLM Component</h4>
	<p>This process will call the repo-tools to do CLM application setup.</p>
</li>
</ul>
