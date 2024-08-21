# Base image
FROM mongo:4.2.0

# Create keyfile
RUN openssl rand -base64 756 > /mongo-keyfile

# Read only permission
RUN chmod 400 /mongo-keyfile
# 999 as Owner and Group
RUN chown 999:999 /mongo-keyfile
