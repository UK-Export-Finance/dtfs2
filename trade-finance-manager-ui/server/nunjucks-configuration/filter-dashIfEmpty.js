const dashIfEmpty = (text) => {
  if (!text) {
    return '-';
  }

  const textStr = String(text);

  const isEmpty = !(textStr && textStr.trim().length > 0);
  return isEmpty ? '-' : textStr;
};

module.exports = dashIfEmpty;
