FROM node:lts AS image

WORKDIR /app

ADD . .
RUN npm install
RUN npm run lint


FROM node:lts
# Identifies the code in the running container
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

WORKDIR /app
COPY --from=image /app /app

CMD node src/index.js
