FROM node:lts-alpine

WORKDIR /app

#RUN npm install --save nunjucks govuk-frontend

ADD package.json .
RUN npm install

ADD . .

ENTRYPOINT node index.js
