# Base image
FROM mongo:5.0.5

# Enviornment variable
ARG ENABLE_REPLICA_SET

# Mongo Key
RUN openssl rand -base64 756 > /mongo-keyfile
RUN chmod 400 /mongo-keyfile
RUN chown 999:999 /mongo-keyfile

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
