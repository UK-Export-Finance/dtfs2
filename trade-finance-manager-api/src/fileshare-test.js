const isPortReachable = require('is-port-reachable');

const urlList = [
  'rrstagingmedia.file.core.windows.net',
  'google.com',
];

const fetchTest = async () => urlList.map(async (url) => {
  const port443 = await isPortReachable(443, { host: url });
  const port80 = await isPortReachable(80, { host: url });
  const port445 = await isPortReachable(445, { host: url });
  const port10101 = await isPortReachable(10101, { host: url });
  return {
    url, port80, port443, port445, port10101,
  };
});

const shareTest = async () => {
  const ports = await fetchTest();

  const portRes = await Promise.all(ports);

  return {
    portRes,
  };
};

module.exports = shareTest;
