FROM node:lts

WORKDIR /app

#RUN npm install --save nunjucks govuk-frontend

ADD package.json .
RUN npm install

ADD index.js .

ENTRYPOINT node index.js
