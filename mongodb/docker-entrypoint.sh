#!/bin/bash
set -e

# Start MongoDB without replica set configuration
mongod --bind_ip_all --port 27017 --keyFile /mongo-keyfile --replSet rs0

until mongo --eval "db.adminCommand('ping')" &>/dev/null; do
    echo "Waiting for MongoDB to start..."
    sleep 1
done

echo "hello"
echo "$MONGO_INITDB_ROOT_USERNAME"
echo "$MONGO_INITDB_ROOT_PASSWORD"
# # Authenticate with the admin database

# # Initialize replica set
echo "Initializing replica set..."
# mongo --eval "rs.initiate({_id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }]})"
echo "rs.initiate({_id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }]})" | mongo -u $${MONGO_INITDB_ROOT_USERNAME} -p $${MONGO_INITDB_ROOT_PASSWORD}

# Authenticate with the admin database
# echo "db.auth('$MONGO_INITDB_ROOT_USERNAME', '$MONGO_INITDB_ROOT_PASSWORD')" | mongo admin

# # Initialize the replica set
# echo "rs.initiate({_id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }]})" | mongo

# # Wait for MongoDB to become the primary node
until mongo --eval "rs.status()" | grep "PRIMARY"; do
  echo "Waiting for MongoDB to become the primary node..."
  sleep 5
done

# Once MongoDB is the primary node, tail the logs to keep the container running
# tail -f /dev/null