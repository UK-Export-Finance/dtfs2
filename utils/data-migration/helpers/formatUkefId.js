const formatUkefId = (ukefId) => {
  if (!ukefId) return '';

  return ukefId.startsWith('00')
    ? ukefId
    : `00${ukefId}`;
};

module.exports = formatUkefId;
