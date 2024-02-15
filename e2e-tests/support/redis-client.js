const redis = require('redis');

// TODO: cleanup
// let client;

// let connection = null;

// let config = null;

// const redisConnect = async (redisHost, redisPort, redisKey) => {
//   let redisOptions = {};

//   if (redisKey) {
//     redisOptions = {
//       auth_pass: redisKey,
//       tls: { servername: redisHost },
//     };
//   }
//   const redisClient = await redis.createClient(redisHost, redisPort, redisOptions);
//   // const redisClient = await redis.createClient({
//   //   url: `redis://alice:foobared@${redisHost}`,
//   // });

//   console.log('redisClient here');

//   redisClient.set('a11111'.concat(new Date().toISOString()), new Date().toISOString());

//   console.log('First SET completed');

//   return redisClient;
// };

// module.exports.setup = async (redisHost, redisPort, redisKey) => {
//   console.log('REDIS setup ------------------------------ redisPort', redisPort);
//   // config = {
//   //   redisHost,
//   //   redisPort,
//   //   redisKey,
//   // };
//   return this;
// };

module.exports.set = async (key, value, maxAge, config) => {
  const redisOptions = {
    auth_pass: config.redisKey,
    tls: { servername: config.redisHost },
  };
  const redisClient = await redis.createClient(config.redisHost, config.redisPort, redisOptions).connect();
  // // // connection = await redisConnect(config.redisHost, config.redisPort, redisOptions);
  await redisClient.set(key, JSON.stringify(value));
  // console.log(`Expire in ${maxAge}`);
  // await redisClient.expire(key, maxAge * 1000);
  await redisClient.disconnect();
};

// module.exports.getConnection = async (redisHost, redisPort, redisKey) => {
//   if (!connection) {
//     connection = await redisConnect(redisHost, redisPort, redisKey);
//     console.log('Redis connect finished');
//     connection.set('AAAAA'.concat(new Date().toISOString()), new Date().toISOString());
//     console.log('Redis connect finished', connection);
//   }

//   return connection;
// };

// module.exports.close = async () => {
//   if (client) {
//     await client.disconnect();
//   }
// };
