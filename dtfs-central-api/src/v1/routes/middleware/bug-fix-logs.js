const bugFixLogs = (req, res, next) => {
  console.info('***Successfully left last middleware***');
  next();
};

module.exports = bugFixLogs;
