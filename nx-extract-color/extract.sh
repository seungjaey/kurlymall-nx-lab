#!/bin/sh
OUTPUT_TEXT_FILE_NAME=output.txt
OUTPUT_JSON_FILE_NAME=ALL_FILE_LIST.json

find -E $1 \
	-type f \
	-regex ".*\.(ts|tsx|css|scss|js)" \
	! -path "*/node_modules/*" \
	! -path "*/.next/*" | awk '{print substr($1, 1)}' > $OUTPUT_TEXT_FILE_NAME

cat $OUTPUT_TEXT_FILE_NAME | jq --raw-input | jq --slurp . > $OUTPUT_JSON_FILE_NAME

rm $OUTPUT_TEXT_FILE_NAME
