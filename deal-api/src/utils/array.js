const sortArrayAlphabetically = (arr, field) => arr.sort((a, b) => a[field].localeCompare(b[field]));

module.exports = {
  sortArrayAlphabetically,
};
