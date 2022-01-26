#!/usr/bin/env bash
eval $(printenv | sed -n "s/^\([^=]\+\)=\(.*\)$/export \1=\2/p" | sed 's/"/\\\"/g' | sed '/=/s//="/' | sed 's/$/"/' >> /etc/profile)

echo "Intialising Openrc..."
openrc
mkdir -p /run/openrc/
touch /run/openrc/softlevel

echo "Intialising SSH..."
if [ ! -d "/var/run/sshd" ]; then
  mkdir -p /var/run/sshd
fi

sed -i "s/SSH_PORT/$SSH_PORT/g" /etc/ssh/sshd_config
echo "cd /home" >> /etc/profile
rc-service sshd start

echo "Intialising Node..."
node src/index.js