const filesharetest = require('./fileshare-test');

const init = async () => {
  const fileshareRes = await filesharetest();
  console.log(JSON.stringify(fileshareRes, null, 4));
};

init();
