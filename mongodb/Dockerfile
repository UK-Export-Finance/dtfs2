FROM mongo:5.0.5

# Create keyfile
RUN openssl rand -base64 756 > /mongo-keyfile

# Set permissions and ownership for keyfile
RUN chmod 400 /mongo-keyfile && \
    chown 999:999 /mongo-keyfile

# Launch MongoDB with replica set configuration
CMD ["mongod", "--bind_ip_all", "--port", "27017", "--keyFile", "/mongo-keyfile", "--replSet", "rs0"]