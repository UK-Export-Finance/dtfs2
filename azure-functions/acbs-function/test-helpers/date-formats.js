const invalidDateFormats = [
  'yy-MM-dd',
  'yy/MM/dd',
  'yy MM dd',
];

const validDateFormats = [
  'MM/dd/yyyy',
  'MM dd yyyy',
  'MM-dd-yy',
  'MM/dd/yy',
  'MM dd yy',
  'yyyy-MM-dd',
  'yyyy/MM/dd',
  'yyyy MM dd',
];

module.exports = {
  invalidDateFormats,
  validDateFormats,
};
