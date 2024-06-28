# Base image
FROM mongo:5.0.5

# Create keyfile
RUN openssl rand -base64 756 > /mongo-keyfile

# Set Read-only persmission to User
RUN chmod 400 /mongo-keyfile
# Set 999 as Owner and Group
RUN chown 999:999 /mongo-keyfile
