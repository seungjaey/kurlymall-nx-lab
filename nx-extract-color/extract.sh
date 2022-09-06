# !/bin/sh
OUTPUT_TEXT_FILE_NAME=output.txt
OUTPUT_JSON_FILE_NAME=COLOR_PATH_LIST.json

find $1 -regex ".*\.(ts|tsx|css|scss|js)" -type f -not -path "node_modules" | awk '{print substr($1, 2)}' > $OUTPUT_TEXT_FILE_NAME

cat $OUTPUT_TEXT_FILE_NAME | jq --raw-input | jq --slurp . > $OUTPUT_JSON_FILE_NAME

rm $OUTPUT_TEXT_FILE_NAME
