#!/usr/local/bin/python3

################################################################################
# Licensed Materials - Property of IBM Copyright IBM Corporation 2012. All Rights Reserved.
# U.S. Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP
# Schedule Contract with IBM Corp.
################################################################################
import subprocess
import json
import time
import argparse
import os.path
import sys

environments = []
sleeptime = 60

# Process all arguments
def processArgs():
    parser = argparse.ArgumentParser()
    parser.add_argument("envDescFile", help="Path to environment description file")
    parser.add_argument("-v", "--verbose", action='store_true', help="Show additional output messages")
    parser.add_argument("--udclient", default='udclient', help="Path to the UCDeploy CLI udclient script.  Defaults to 'udclient'")
    parser.add_argument("--weburl", default='https://udeploy04.rtp.raleigh.ibm.com:8443', help="URL of the UCDeploy server.  Defaults to 'https://udeploy04.rtp.raleigh.ibm.com:8443'")
    parser.add_argument("--authtoken", default='d762cfff-67cd-4287-a31c-7d241042f4dd', help="Authentication token for the UCDeploy server.  Defaults to 'd762cfff-67cd-4287-a31c-7d241042f4dd'")
    parser.add_argument("--iwdcli", default='deployer', help="Path to the IWD/IPAS CLI script.  Defaults to 'deployer'")
    parser.add_argument("--iwdhost", default='fit-iwd-3.rtp.raleigh.ibm.com', help="FQDN of the IWD/IPAS server.  Defaults to 'fit-iwd-3.rtp.raleigh.ibm.com'")
    parser.add_argument("--iwduser", default='ratlauto@us.ibm.com', help="ID used to login to iwdhost.  Defaults to 'ratlauto@us.ibm.com'")
    parser.add_argument("--iwdpassword", default='ratlauto', help="Password for iwduser.  Defaults to 'ratlauto'")
    parser.add_argument("--outputFile", help="Path to file where environment info will be written");

    args = parser.parse_args()

    # Verify envDescFile
    try:
        file = open(args.envDescFile, 'r')
    except IOError:
        print('Unable to open environment description file: ' + args.envDescFile)
        exit()

    # Verify outputFile
    if (args.outputFile is not None) and len(args.outputFile) > 0:
        try:
            file = open(args.outputFile, 'w')
        except IOError:
            print('Unable to open/create output file: ' + args.outputFile)
            exit()
    
    return args


# Provision the UCDeploy environment.  Input consists of JSON like this.
#{
#  "name": "capacityTesting",
#  "description": "capacityTesting environment",
#  "application": "HelloWorld Application",
#  "blueprint": "tneal Rational Base OS",
#  "baseResource": "/Testing",
#  "nodeProperties": {
#    "/tneal Rational Base OS-RHEL/os_part": {
#      "cloud_group": "shared cloud group 1",
#      "password": "aut0mat10n",
#      "password_0": "aut0mat10n"
#    }
#  }
#}

# Response data will be JSON like the following.
#{
#  "id": "eb017b83-f6a4-41c4-bd19-d47b37a6c16a",
#  "name": "capacityTesting3",
#  "description": "capacityTesting environment",
#  "color": "#ffffff",
#  "requireApprovals": false,
#  "lockSnapshots": false,
#  "calendarId": "3f7dbd1d-182c-4f75-8aca-354fc264de7b",
#  "active": true,
#  "cleanupDaysToKeep": 0,
#  "cleanupCountToKeep": 0,
#  "conditions": [
#  ]
#}

def create_environment(envDescFileName):
    # Load the environment description file used to provision the UCDeploy env
    envDescFile = open(envDescFileName, 'r')
    envDesc = json.load(envDescFile);

    # Add index to environment name and save to file used to create the env
    envDesc['name'] = envDesc['name'] 
    descFileName = 'envDescFile'
    updatedEnvDescFile = open(descFileName, 'w')
    json.dump(envDesc, updatedEnvDescFile)
    updatedEnvDescFile.close()

    # Create the environment in UCDeploy and retrieve the env ID from stdout
    createEnvCmd = args.udclient + " -weburl " + args.weburl + " -authtoken " + args.authtoken + " provisionEnvironment " + descFileName
    envInfo = dict()
    envInfo['name'] = envDesc['name']
    envInfo['application'] = envDesc['application']
    try:
        p = subprocess.Popen(createEnvCmd, stdout=subprocess.PIPE, shell=True)
        print ('output stdout of subprocess')

        pdata=p.stdout.read().decode('utf8')
        print (pdata)
        env = json.loads( pdata )
        envInfo['id'] = env['id']
        print("Created environment: name=" + env['name'] + "\tID=" + env['id'])
    except ValueError:
        envInfo['status'] = 'Failed'
        print('Failed to create environment via command: ' + createEnvCmd)
        return envInfo

    # Wait until the virtual system instance has finished deploying.
    ret=waitForInstance(envDesc['application'], env['name'])
    if ret == 'Failed' :
        envInfo['status'] = 'Failed'

    # Return the newly created environment id
    return envInfo

def waitForInstance(appName, envName):
    # Wait until the virtual system instance has finished deploying.
    print('Waiting for instance to provision...')
    cmdFileName = 'checkInstance.txt'
    cmdFile = open(cmdFileName, 'w')
    cmdFile.write('instance = deployer.virtualsystems[\'' + appName + '-' + envName + '\'][0]\n')
    cmdFile.write('print(instance.currentstatus_text)\n')
    cmdFile.close()
    checkInstanceCmd = args.iwdcli + " -h " + args.iwdhost + " -u " + args.iwduser + " -p " + args.iwdpassword + " -f " + cmdFileName
    time.sleep(sleeptime)  # Give instance time to spin up before we attempt to get status
    waittime=0;
    while True:
        p = subprocess.Popen(checkInstanceCmd, stdout=subprocess.PIPE, shell=True)
        status = p.stdout.readline().strip().decode('utf8')
        if args.verbose:
            print('Status of instance is: ' + status)
        else:
            sys.stdout.write('.')
            sys.stdout.flush()
        if status == 'Started':
            print
            return 'Started'          
            break
        time.sleep(sleeptime);
        waittime=waittime+1;
        if waittime > 100 :
            print ('more than 100 minutes passed, treat it as Failed') 
            return 'Failed' 
            break

def write_output(path):
    try:
        f = open(path, 'w')
        json.dump(environments, f, indent=4)
    except IOError:
        print('Failed to write output file: ' + path)


# Process/check arguments given
args = processArgs()

# Create the specified number of environments, then delete them
env = create_environment(args.envDescFile)

environments.append(env)

if len(args.outputFile) > 0:
    write_output(args.outputFile)

