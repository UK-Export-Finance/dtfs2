# Node Alpine Docker Image
FROM node:18.2-alpine3.14

# Variable
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
ENV SSH_PORT=2222

# SSH Setup
# 1. Artifcats
COPY init.sh /bin/init.sh
COPY sshd_config /etc/ssh/
RUN chmod 755 /bin/init.sh
# 2. Install packages
RUN apk add bash openrc openssh curl \
    && echo "root:Docker!" | chpasswd \
    && rm -rf /var/cache/apk/* \
    && rc-update add sshd
#3. Expose SSH port
EXPOSE 80 ${SSH_PORT}

# Node setup
WORKDIR /app
COPY package.json .
COPY package-lock.json .
# 4. Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps
RUN npm cache clean --force
COPY . .

# Execute Script
ENTRYPOINT ["/bin/init.sh"]

# Hot reloading
# CMD node server/index.js