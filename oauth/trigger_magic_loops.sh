#!/bin/bash

# Path to the file to monitor
FILE_TO_WATCH="../Oauth/access_token.txt"

# Check if the file exists
if [ ! -f "$FILE_TO_WATCH" ]; then
  echo "File $FILE_TO_WATCH does not exist!"
  exit 1
fi

echo "Monitoring $FILE_TO_WATCH for changes..."

# Use fswatch to monitor the file for changes
fswatch -o "$FILE_TO_WATCH" | while read event; do
  # Once the file is modified, trigger Magic Loops API
  echo "File changed. Triggering Magic Loops API..."
  ESCAPED_CONTENT=$(cat "$FILE_TO_WATCH" | jq -Rs .)

curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"input\": $ESCAPED_CONTENT}" \
  "https://magicloops.dev/api/loop/run/bdfcbc26-8a99-4ea0-9bed-f3a53c9e2ff1/run";

  echo "Triggered Magic Loops successfully."
done
