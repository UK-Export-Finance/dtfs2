# Node Alpine Docker Image
FROM node:14.18.1-alpine3.13

# Variables
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
ENV SSH_PORT=2222

# Node Setup
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

# SSH Setup
# 1. Artifcats
ADD init.sh /bin/init.sh
ADD sshd_config /etc/ssh/
RUN chmod 755 /bin/init.sh
# 2. Install packages
RUN apk add bash openrc openssh curl \
    && echo "root:Docker!" | chpasswd \
    && rm -rf /var/cache/apk/* \
    && rc-update add sshd
#3. Expose SSH port
EXPOSE 80 ${SSH_PORT}

# Execute Script
ENTRYPOINT ["/bin/init.sh"]

# Hot reloading
# CMD node src/index.js