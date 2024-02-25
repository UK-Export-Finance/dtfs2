FROM mongo:5.0.5

# Copy entrypoint script into the container
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Set permissions for entrypoint script
RUN chmod +x /docker-entrypoint.sh

# Create keyfile
RUN openssl rand -base64 756 > /mongo-keyfile

# Set permissions and ownership for keyfile
RUN chmod 400 /mongo-keyfile && \
    chown 999:999 /mongo-keyfile

# Set the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]