#!/bin/sh
OUTPUT_TEXT_FILE_NAME=output.txt
OUTPUT_JSON_FILE_NAME=ALL_PAGES_LIST.json

find -E /Users/mk-am16-075/kurly/kurlymall-nx/pages -type f -regex ".*\.(ts|tsx|css|scss|js)" > $OUTPUT_TEXT_FILE_NAME
jq -Rn '[inputs]' $OUTPUT_TEXT_FILE_NAME > $OUTPUT_JSON_FILE_NAME

rm $OUTPUT_TEXT_FILE_NAME
