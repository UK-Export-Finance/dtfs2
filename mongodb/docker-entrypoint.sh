#!/bin/bash
set -e

# Start MongoDB without replica set configuration
mongod --bind_ip_all --port 27017 --keyFile /mongo-keyfile --fork --logpath /var/log/mongodb/mongod.log

# Initialize replica set
echo "Initializing replica set..."
mongo --eval "rs.initiate({_id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }]})"

# Wait for MongoDB to become the primary node
until mongo --eval "rs.status()" | grep "PRIMARY"; do
  echo "Waiting for MongoDB to become the primary node..."
  sleep 5
done

# Once MongoDB is the primary node, tail the logs to keep the container running
tail -f /dev/null