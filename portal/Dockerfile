FROM node:14.18.1-alpine3.13
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

######## SSH ########
RUN mkdir -p /home/LogFiles /opt/startup \
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

EXPOSE 2009

# Identifies the code in the running container
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
CMD node server/index.js
