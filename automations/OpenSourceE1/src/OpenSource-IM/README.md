<h1>Open Source Component of IBM Installation Manager</h1>

<h2>Overview</h2>
<p>All processes / scripts inside this component are basically for IBM Installation Manager only.</p>

<h2>Configurations</h2>

<h3>Environment Property Definitions</h3>
<p>The environment property definitions here are for users to configure the repository for upgrade existing IBM Installation Manager to a higher version.</p>
<ul>
<li>
	<h4>IM_REPO</h4>
	<p>You can leave <strong>IM_REPO</strong> empty(the default value) if your instance(s) have public network access and able to visit IBM service repository, use it if you want to upgrade IBM Installation Manager to the latest version.</p>
	<p>You can also setup your own repository if you want to upgrade to a specified version, please read instructions from <a title="IBM Support Portal" href="http://www-01.ibm.com/support/docview.wss?uid=swg24037254">IBM Support Portal</a> and download the latest update package(with <strong>Update</strong> in the name, like <i>1.7.3.0-IBMIM-Multiplatform-Update-20140521_1925</i>) from Fix Central.</p>
	<p>You will receive a zip file, extract the content into a folder under your web server's document root like <i>/var/www/example.com/im_update</i>, then you will be possible to access http://www.example.com/im_update/repository.config, use this full URL as the value.</p>
</li>
<li>
	<h4>IM_REPO_USERNAME</h4>
	<p>If your repository is secured with user authentication mechanism, you need to specify the username who has the access right here, leave it empty(the default value) if you leave IM_REPO empty or your own repository don't have such mechanism.</p>
</li>
<li>
	<h4>IM_REPO_PASSWORD</h4>
	<p>This is the password of the user account which you are going to use to access the repository, must be provided if IM_REPO_USERNAME is provided.</p>
</li>
<li>
	<h4>IM_MASTER_PASSWORD</h4>
	<p>The master password which will be used for IBM Installation Manager secure store, must be provided if IM_REPO_USERNAME and IM_REPO_PASSWORD be provided, you can find more information about it from the information center.</p>
</li>
</ul>

<h3>Processes</h3>
<ul>
<li>
	<h4>Install IBM IM Administrative Scripts</h4>
	<p>This process is used to download and install the administrative scripts from uDeploy to your instance(s), and also design to verify existing IBM Installation Manager(not implemented yet), variable <strong>IM_HOME</strong> will be registered to the environment.</p>
	<p>If you IBM Installation Manager is not installed in the default folder <i>/opt/IBM/InstallationManager</i>, you can change it in the Component Process Properties in uDeploy.</p>
</li>
<li>
	<h4>Upgrade Existing IBM IM</h4>
	<p>This process will do the upgrade of IBM Installation Manager by using the repository and credential you specified in Environment Property Definitions.<p>
</li>
</ul>
