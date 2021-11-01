FROM node:14.18.1-alpine3.13 AS image

WORKDIR /app

COPY . .
RUN npm install --legacy-peer-deps

FROM node:14.18.1-alpine3.13
# Identifies the code in the running container
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

WORKDIR /app
COPY --from=image /app /app

CMD node src/index.js