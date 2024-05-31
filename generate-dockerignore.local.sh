#!/bin/bash

OUTPUT_FILE=.dockerignore

TEST_PATTERNS=( \
  ".test.js" \
  ".test.ts" \
  ".tests.js" \
  ".tests.ts" \
  ".component-test.js" \
  ".component-tests.js" \
  ".api-test.js" \
  ".api-test.ts" \
  ".api-tests.js" \
  ".api-tests.ts" \
)

echo "Attempting to create base '$OUTPUT_FILE'..."

rm $OUTPUT_FILE
cp .base-local.dockerignore $OUTPUT_FILE

echo "Successfully created base '$OUTPUT_FILE'"

echo "Attempting to add all test files to '$OUTPUT_FILE'..."

for testPattern in ${TEST_PATTERNS[@]}; do
  echo "Finding files with the '$testPattern' extension..."
  echo  >> $OUTPUT_FILE 
  echo "# '$testPattern' FILES" >> $OUTPUT_FILE
  find **/* -name *$testPattern | tee -a $OUTPUT_FILE > /dev/null
done

echo  >> $OUTPUT_FILE

echo "Successfully added all test files to '$OUTPUT_FILE'"
