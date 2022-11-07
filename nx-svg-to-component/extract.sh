#!/bin/sh
OUTPUT_TEXT_FILE_NAME=SVG_FILE_PATH_LIST.txt
OUTPUT_JSON_FILE_NAME=SVG_FILE_PATH_LIST.json

find  -name "*.svg" | awk '{print substr($1, 2)}' > $OUTPUT_TEXT_FILE_NAME

cat $OUTPUT_TEXT_FILE_NAME | jq --raw-input | jq --slurp . > $OUTPUT_JSON_FILE_NAME

rm -rf $OUTPUT_TEXT_FILE_NAME

