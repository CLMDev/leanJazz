#!/usr/local/bin/python3

################################################################################
# Licensed Materials - Property of IBM Copyright IBM Corporation 2012. All Rights Reserved.
# U.S. Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP
# Schedule Contract with IBM Corp.
################################################################################
import subprocess
import json
import argparse

environments = []
sleeptime = 30

# Process all arguments
def processArgs():
    parser = argparse.ArgumentParser()
    parser.add_argument("envListPath", help="Path to JSON file containing list of environments created by checkCloudCapacity")
    parser.add_argument("-v", "--verbose", action='store_true', help="Show additional output messages")
    parser.add_argument("--udclient", default='udclient', help="Path to the UCDeploy CLI udclient script.  Defaults to 'udclient'")
    parser.add_argument("--weburl", default='https://udeploy04.rtp.raleigh.ibm.com:8443', help="URL of the UCDeploy server.  Defaults to 'https://udeploy04.rtp.raleigh.ibm.com:8443'")
    parser.add_argument("--authtoken", default='d762cfff-67cd-4287-a31c-7d241042f4dd', help="Authentication token for the UCDeploy server.  Defaults to 'd762cfff-67cd-4287-a31c-7d241042f4dd'")

    args = parser.parse_args()

    # Verify envListPath
    try:
        file = open(args.envListPath, 'r')
    except IOError:
        print('Unable to open environment list file: ' + args.envListPath)
        exit()

    return args


# Input consists of JSON like this.
#[
#    {
#        "application": "HelloWorld Application", 
#        "name": "capacityTest0", 
#        "id": "b59f7d3a-81a5-4365-8919-b422505e142c"
#    }, 
#    {
#        "application": "HelloWorld Application", 
#        "name": "capacityTest1", 
#        "id": "3c64b20b-ed14-4f06-ab30-4ce49a991881"
#    }
#]

def delete_environment(env):
    # Delete the UCDeploy environment
    if args.verbose:
        print('Deleting environment ' + env['name'] + ' with ID: ' + env['id'])
    deleteEnvCmd = args.udclient + " -weburl " + args.weburl + " -authtoken " + args.authtoken + " deleteEnvironment -environment " + env['id'] + " -deleteAttachedResources true -deleteCloudInstances true"
    p = subprocess.Popen(deleteEnvCmd, stdout=subprocess.PIPE, shell=True)

def delete_environments(envListPath):
    try:
        envListFile = open(envListPath, 'r')
        environments = json.load(envListFile);
    except ValueError:
        print('Failed to load environment list from: ' + envListPath)
        return
    for environment in environments:
        delete_environment(environment)
        

# Process/check arguments given
args = processArgs()

# Delete the environments given in the specified file
delete_environments(args.envListPath)


