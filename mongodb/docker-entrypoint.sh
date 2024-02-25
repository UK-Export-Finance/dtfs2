#!/bin/bash
set -e

# Start MongoDB without replica set configuration
mongod --bind_ip_all --port 27017 --keyFile /mongo-keyfile --replSet rs0

until mongo --eval "db.adminCommand('ping')" &>/dev/null; do
    echo "Waiting for MongoDB to start..."
    sleep 1
done

# # Initialize replica set
echo "Initializing replica set..."
echo "rs.initiate({_id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }]})" | mongo -u $${MONGO_INITDB_ROOT_USERNAME} -p $${MONGO_INITDB_ROOT_PASSWORD}

# # Wait for MongoDB to become the primary node
until mongo --eval "rs.status()" | grep "PRIMARY"; do
  echo "Waiting for MongoDB to become the primary node..."
  sleep 5
done
