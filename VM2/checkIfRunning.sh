#!/bin/bash

while 1
do
    RESULT = $(pgrep procname)
    if [["$result" == ""]]; then
        mail -s "Process not running" address@domain.tld -t "The process is not running"
    fi
done
