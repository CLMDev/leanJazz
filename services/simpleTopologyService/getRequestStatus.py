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
    parser.add_argument("request", help="request id")
    parser.add_argument("-v", "--verbose", action='store_true', help="Show additional output messages")
    parser.add_argument("--udclient", default='udclient', help="Path to the UCDeploy CLI udclient script.  Defaults to 'udclient'")
    parser.add_argument("--weburl", default='https://udeploy04.rtp.raleigh.ibm.com:8443', help="URL of the UCDeploy server.  Defaults to 'https://udeploy04.rtp.raleigh.ibm.com:8443'")
    parser.add_argument("--authtoken", default='d762cfff-67cd-4287-a31c-7d241042f4dd', help="Authentication token for the UCDeploy server.  Defaults to 'd762cfff-67cd-4287-a31c-7d241042f4dd'")
    args = parser.parse_args()
    return args

def request_status(requestId):
    getRequestStatusCmd = args.udclient + " -weburl " + args.weburl + " -authtoken " + args.authtoken + " getApplicationProcessRequestStatus -request " + requestId 
    try:
        p = subprocess.Popen(getRequestStatusCmd, stdout=subprocess.PIPE, shell=True)
        print ('output stdout of subprocess')

        pdata=p.stdout.read().decode('utf8')
        print (pdata)
    except ValueError:
        print('Failed to request process! ')

# Process/check arguments given
args = processArgs()

request_status(args.request)

