


# Build container

FROM node:lts-alpine as build


RUN mkdir /tfm-build

WORKDIR /tfm-build

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5100

CMD [ "npm", "start" ]
