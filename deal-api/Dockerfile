FROM node:lts

WORKDIR /app


# create keypairs for signing/verifying jwt tokens
# -----
RUN apt-get update && \
    apt-get install openssl

RUN mkdir ./.ssl
RUN openssl genrsa -out ./.ssl/private.pem 2048
RUN openssl rsa -in ./.ssl/private.pem -outform PEM -pubout -out ./.ssl/public.pem
# -----


ADD package.json .
RUN npm install

ADD ./src ./src
ADD ./.eslintrc.js ./.eslintrc.js
RUN npm run lint

RUN mkdir -p ./reports/coverage/api-test
RUN chown -R 1000 ./reports
ADD ./api-tests ./api-tests
ADD ./__mocks__ ./__mocks__
ADD ./api-test.jest.config.js ./api-test.jest.config.js
ADD ./bin ./bin

RUN chown 1000 ./.ssl/private.pem ./.ssl/public.pem
USER 1000
CMD node src/index.js
