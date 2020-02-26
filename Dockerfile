FROM node:lts-alpine

WORKDIR /app

#RUN npm install --save nunjucks govuk-frontend

ADD package.json .
RUN npm install

ADD static ./static
ADD index.js .

ENTRYPOINT node index.js
