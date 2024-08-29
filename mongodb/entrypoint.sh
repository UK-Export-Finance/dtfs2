#!/bin/bash

# Start MongoDB with replica set if `ENABLE_REPLICA_SET` is true
if [ "$ENABLE_REPLICA_SET" == "true" ]; then
  mongod --bind_ip_all --keyFile /mongo-keyfile --replSet rs0
else
  mongod --bind_ip_all
fi
