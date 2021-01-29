const dashIfEmpty = (text) => {
  const isEmpty = !(text && text.trim().length > 0);
  return isEmpty ? '-' : text;
};

export default dashIfEmpty;
