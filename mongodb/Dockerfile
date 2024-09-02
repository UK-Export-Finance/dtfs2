# Base image
FROM mongo:5.0.5

# Mongo Key
RUN openssl rand -base64 756 > /mongo-keyfile
RUN chmod 400 /mongo-keyfile
RUN chown 999:999 /mongo-keyfile

# Execute
# ENTRYPOINT syntax does allow an execution of MongoDB
# with custom authentication and database.
# To Run MongoDB with RS, uncomment second CMD statement.


# TODO: DTFS2-7317

# Non-RS initilisation
# CMD ["mongod", "--bind_ip_all", "--auth"]

# RS initlisation
# CMD ["mongod", "--bind_ip_all", "--keyFile", "/mongo-keyfile", "--replSet", "rs0"]
