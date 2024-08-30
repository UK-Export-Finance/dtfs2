# Base image
FROM mongo:5.0.5

# Enviornment variable
ARG MONGO_INITDB_DATABASE
ARG MONGO_INITDB_ROOT_USERNAME
ARG MONGO_INITDB_ROOT_PASSWORD
ARG ENABLE_REPLICA_SET

ENV MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
ENV MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
ENV MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}
ENV ENABLE_REPLICA_SET=${ENABLE_REPLICA_SET}

# Mongo Key
RUN openssl rand -base64 756 > /mongo-keyfile
RUN chmod 400 /mongo-keyfile
RUN chown 999:999 /mongo-keyfile

# Entrypoint
# CMD ["mongod", "--bind_ip_all", "--auth"]
CMD ["sh", "-c", "if [ \"$ENABLE_REPLICA_SET\" = \"true\" ]; then mongod --bind_ip_all --keyFile /mongo-keyfile --replSet rs0; else mongod --bind_ip_all --auth; fi"]
