FROM node:lts

WORKDIR /app

ADD . .
RUN npm install

# Identifies the code in the running container
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

CMD node src/index.js
