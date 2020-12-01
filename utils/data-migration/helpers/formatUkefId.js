const formatUkefId = (ukefId) => (ukefId.startsWith('00')
  ? ukefId
  : `00${ukefId}`
);

module.exports = formatUkefId;
