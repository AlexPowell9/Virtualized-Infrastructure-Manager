#!/bin/bash

while true
do
    if [[ "$(pgrep node)" == "" ]]; then
        echo "VM2 has crashed" | mail -s "VM2 down" christian-yores@hotmail.com
        break
    fi
done

