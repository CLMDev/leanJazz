#!/bin/sh
#############################################################################
#
# (c) Copyright 2014 IBM
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
#############################################################################

targetFile=/etc/security/limits.conf

nofilehard="hard nofile 65536"
nofilesoft="soft nofile 65536"
corehard="hard core unlimited"
coresoft="soft core unlimited"
stackhard="hard stack 32768"
stacksoft="soft stack 32768"

profileFile=/etc/profile
echo "ulimit -u 10000" >> $profileFile

while read currentline
do
if [[ $currentline == *$nofilehard* ]]
then
	foundnofilehard=TRUE
	continue
fi 
if [[ $currentline == *$nofilesoft* ]]
then
        foundnofilesoft=TRUE
        continue
fi
if [[ $currentline == *$corehard* ]]
then
        foundcorehard=TRUE
        continue
fi
if [[ $currentline == *$coresoft* ]]
then
        foundcoresoft=TRUE
        continue
fi
if [[ $currentline == *$stackhard* ]]
then
        foundstackhard=TRUE
        continue
fi
if [[ $currentline == *$stacksoft* ]]
then
        foundstacksoft=TRUE
        continue
fi
done < $targetFile

cp $targetFile $targetFile.BAK

if [[ $foundnofilehard == TRUE ]]
then
	echo found entry do nothing
else
	echo \* $nofilehard >> $targetFile
fi
if [[ $foundnofilesoft == TRUE ]]
then
        echo found entry do nothing
else
        echo \* $nofilesoft >> $targetFile
fi
if [[ $foundcorehard == TRUE ]]
then
        echo found entry do nothing
else
        echo \* $corehard >> $targetFile
fi

if [[ $foundcoresoft == TRUE ]]
then
        echo found entry do nothing
else
        echo \* $coresoft >> $targetFile
fi
if [[ $foundstackhard == TRUE ]]
then
        echo found entry do nothing
else
        echo \* $stackhard >> $targetFile
fi
if [[ $foundstacksoft == TRUE ]]
then
        echo found entry do nothing
else
        echo \* $stacksoft >> $targetFile
fi

