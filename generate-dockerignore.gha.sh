#!/bin/bash

OUTPUT_FILE=.dockerignore

echo "Attempting to create gha '$OUTPUT_FILE'..."

rm $OUTPUT_FILE
cp .base-gha.dockerignore $OUTPUT_FILE

echo "Successfully created gha '$OUTPUT_FILE'"
