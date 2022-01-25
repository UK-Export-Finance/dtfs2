FROM node:14.18.1-alpine3.13
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

######## SSH ########
RUN mkdir -p /home/LogFiles /opt/startup \
     && echo "root:Docker!" | chpasswd \
     && apk update \
     && apk add openssh curl wget tcptraceroute openrc htop nano \
     && rc-update add sshd \
     && mkdir -p /run/openrc/ \
     && touch /run/openrc/softlevel \
     && mkdir -p /var/run/sshd

COPY sshd_config /etc/ssh/

EXPOSE 2009

# Identifies the code in the running container
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
CMD node server/index.js
