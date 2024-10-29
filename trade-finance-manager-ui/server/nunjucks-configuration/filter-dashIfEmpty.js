const dashIfEmpty = (text) => {
  if (!text) {
    return '-';
  }

  const textStr = String(text);

  const isEmpty = !textStr || textStr.trim().length === 0 || textStr === 'NaN' || textStr === 'Invalid date' || textStr === 'Invalid Date';

  return isEmpty ? '-' : textStr;
};

module.exports = dashIfEmpty;
