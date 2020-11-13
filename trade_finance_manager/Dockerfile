
FROM node:lts-alpine as build

# Build container


RUN mkdir /tfm-build

WORKDIR /tfm-build

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "node", "server/index.js" ]
