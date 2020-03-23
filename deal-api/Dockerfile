FROM node:lts-alpine

WORKDIR /app

# create keypairs for signing/verifying jwt tokens
# -----
RUN apk upgrade --update-cache --available && \
    apk add openssl

RUN mkdir ./.ssl
RUN openssl genrsa -out ./.ssl/private.pem 2048
RUN openssl rsa -in ./.ssl/private.pem -outform PEM -pubout -out ./.ssl/public.pem
# -----

ADD package.json .
RUN npm install

ADD ./src ./src

CMD node src/index.js
