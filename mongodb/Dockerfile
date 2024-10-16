# Base image
FROM mongo:4.2.0

# Enviornment variable
ARG MONGO_INITDB_DATABASE
ARG MONGO_INITDB_ROOT_USERNAME
ARG MONGO_INITDB_ROOT_PASSWORD

ENV MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
ENV MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
ENV MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}

# Mongo Key
RUN openssl rand -base64 756 > /mongo-keyfile
RUN chmod 400 /mongo-keyfile
RUN chown 999:999 /mongo-keyfile

# Execute - TODO: DTFS2-7317
# ENTRYPOINT syntax does allow an execution of MongoDB
# with custom authentication and database.
# To Run MongoDB with RS, uncomment second CMD statement.

# Non-RS initilisation
CMD ["mongod", "--bind_ip_all", "--auth"]

# RS initlisation
# CMD ["mongod", "--bind_ip_all", "--keyFile", "/mongo-keyfile", "--replSet", "rs0"]
