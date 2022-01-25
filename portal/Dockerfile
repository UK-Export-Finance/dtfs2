FROM node:14.18.1-alpine3.13
COPY package.json .
COPY . .

######## SSH ########
RUN npm install \
     && mkdir -p /home/LogFiles /opt/startup \
     && echo "root:Docker!" | chpasswd \
     && apk update \
     && apk add openssh-server curl wget tcptraceroute openrc htop \
     && rm /etc/ssh/sshd_config \
     && mkdir -p /tmp

COPY sshd_config /etc/ssh/
COPY ssh_setup.sh /tmp

RUN chmod +x /tmp/ssh_setup.sh \
    && (sleep 1;/tmp/ssh_setup.sh 2>&1 > /dev/null) \
    && rm -rf /tmp/*

EXPOSE 2222 80

WORKDIR /app

# Identifies the code in the running container
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
CMD node server/index.js
