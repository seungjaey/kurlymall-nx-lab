#!/bin/sh
OUTPUT_TEXT_FILE_NAME=SVG_FILE_PATH_LIST.txt
OUTPUT_JSON_FILE_NAME=SVG_FILE_PATH_LIST.json

find /Users/mk-am16-075/kurly/kurlymall-nx -name "*\.svg" -type f > $OUTPUT_TEXT_FILE_NAME
jq -Rn '[inputs]' $OUTPUT_TEXT_FILE_NAME > $OUTPUT_JSON_FILE_NAME
cat $OUTPUT_TEXT_FILE_NAME | jq --raw-input | jq --slurp . > $OUTPUT_JSON_FILE_NAME

rm -rf $OUTPUT_TEXT_FILE_NAME

