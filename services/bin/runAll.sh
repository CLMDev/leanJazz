#!/bin/sh
. ./env.sh

./runApp.sh 
./runTests.sh 
./runTestsFromLinkedContainer.sh 
./runTestsFromContainer.sh 


