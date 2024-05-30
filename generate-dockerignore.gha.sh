#!/bin/bash

OUTPUT_FILE=.dockerignore

rm $OUTPUT_FILE
cp .gha.dockerignore $OUTPUT_FILE
