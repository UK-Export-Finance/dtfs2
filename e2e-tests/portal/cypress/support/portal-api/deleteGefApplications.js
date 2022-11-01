const { listGefApplications, logIn, deleteGefApplication } = require('./api');

const deleteGefApplications = (token, deals) => {
  if (!deals || !deals.length) return;
  deals.forEach((deal) => deleteGefApplication(token, deal._id));
};

module.exports = (opts) => logIn(opts).then((token) => {
  listGefApplications(token).then(async (deals) => {
    await deleteGefApplications(token, deals);
  });
});
