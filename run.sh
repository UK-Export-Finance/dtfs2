#!/usr/bin/env bash

export PORT=5000
docker build --tag dtfs2 . && docker run -p $PORT:$PORT -it --rm dtfs2 bash
