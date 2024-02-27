FROM mongo:5.0.5

# Create keyfile
RUN openssl rand -base64 756 > /mongo-keyfile

# Set permissions and ownership for keyfile
RUN chmod 400 /mongo-keyfile && \
    chown 999:999 /mongo-keyfile
