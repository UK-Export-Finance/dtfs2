FROM node:lts AS image

WORKDIR /app

ADD package.json .
RUN npm install

ADD ./src ./src


FROM node:lts AS lint

WORKDIR /app
COPY --from=image /app /app

ADD ./.eslintrc.js ./.eslintrc.js
RUN npm run lint


FROM node:lts AS test

WORKDIR /app
COPY --from=image /app /app

#RUN mkdir -p ./reports/coverage/api-test
#RUN chown -R 1000 ./reports
ADD ./api-tests ./api-tests
ADD ./__mocks__ ./__mocks__
ADD ./api-test.jest.config.js ./api-test.jest.config.js
ADD ./bin ./bin

#USER 1000
CMD node src/index.js
