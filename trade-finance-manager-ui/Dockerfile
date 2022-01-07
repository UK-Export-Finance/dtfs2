FROM node:14.18.1-alpine3.13

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Identifies the code in the running container
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

CMD node server/index.js