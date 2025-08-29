const { Parser } = require('json2csv');

const downloadCsv = (res, fileName, fields, data) => {
  const json2csv = new Parser({ fields });
  const csv = json2csv.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment(`${fileName}.csv`);
  return res.send(csv);
};

module.exports = downloadCsv;
