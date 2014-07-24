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

# Process all arguments
def processArgs():
    parser = argparse.ArgumentParser()
    parser.add_argument("template", help="Path to request template file")
    parser.add_argument("-v", "--verbose", action='store_true', help="Show additional output messages")
    parser.add_argument("--udclient", default='udclient', help="Path to the UCDeploy CLI udclient script.  Defaults to 'udclient'")
    parser.add_argument("--weburl", default='https://udeploy04.rtp.raleigh.ibm.com:8443', help="URL of the UCDeploy server.  Defaults to 'https://udeploy04.rtp.raleigh.ibm.com:8443'")
    parser.add_argument("--authtoken", default='d762cfff-67cd-4287-a31c-7d241042f4dd', help="Authentication token for the UCDeploy server.  Defaults to 'd762cfff-67cd-4287-a31c-7d241042f4dd'")
    args = parser.parse_args()
    # Verify template file 
    try:
        file = open(args.template, 'r')
    except IOError:
        print('Unable to open request template file: ' + args.template)
        exit()

    return args

# App process request template like this
#{
#  "application": "CLM-E1-distributed-linux",
#  "applicationProcess": "Deploy-CLM-E1-CLMOnly -no-prompt",
#  "environment": "pool-5f6f485-201407240036-No2",
#  "onlyChanged": "True",
#  "properties": {
#  },
#  "versions": [
#    {
#      "version": "CALM501-I20140724-0020",
#      "component": "clm"
#    },
#    {
#      "version": "20140526-0154",
#      "component": "RAT_DB2_CreateDB"
#    },
#    {
#      "version": "20140526-0154",
#      "component": "Rational AutomationPrep"
#    },
#    {
#      "version": "20140716-2135",
#      "component": "InstallCLM"
#    },
#    {
#      "version": "20140526-0151",
#      "component": "WASConfiguration"
#    },
#    {
#      "version": "20140625-2229",
#      "component": "JTSSetup"
#    },
#    {
#      "version": "20140627-0032",
#      "component": "ConfigureCLM"
#    },
#    {
#      "version": "20140526-0151",
#      "component": "ConfigureIHS"
#    }
#  ],
#}

def request_process(template):
    createEnvCmd = args.udclient + " -weburl " + args.weburl + " -authtoken " + args.authtoken + " requestApplicationProcess " + template 
    try:
        p = subprocess.Popen(createEnvCmd, stdout=subprocess.PIPE, shell=True)
        print ('output stdout of subprocess')

        pdata=p.stdout.read().decode('utf8')
        print (pdata)
    except ValueError:
        print('Failed to request process! ')

# Process/check arguments given
args = processArgs()

request_process(args.template)

