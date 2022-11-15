#!/bin/bash
OUTPUT_TEXT_FILE_NAME=WWW_V2_ALL_FILE_LIST.txt
OUTPUT_JSON_FILE_NAME=WWW_V2_ALL_FILE_LIST.json

find /Users/mk-am16-075/kurly/kurly-www-v2 \
  -type f \
  ! -path "*/docker/*" \
  ! -path "*/.git/*" > $OUTPUT_TEXT_FILE_NAME
jq -Rn '[inputs]' $OUTPUT_TEXT_FILE_NAME > $OUTPUT_JSON_FILE_NAME

rm -rf $OUTPUT_TEXT_FILE_NAME
