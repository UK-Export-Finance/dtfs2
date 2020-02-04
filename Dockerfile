FROM node:lts

WORKDIR /app

#RUN npm install --save nunjucks govuk-frontend

ADD package.json .
ADD index.js .

RUN npm install

ENTRYPOINT node index.js
