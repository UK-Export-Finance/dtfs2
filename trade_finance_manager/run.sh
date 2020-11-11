#!/usr/bin/env bash

export PORT=5000

while [ true ]
do
    docker build --tag dtfs2 . && docker run -p $PORT:$PORT -it --rm --name dtfs2 dtfs2 bash
    sleep 1
done
