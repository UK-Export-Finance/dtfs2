const sortArrayAlphabetically = (arr, field) => arr.sort((previous, current) => previous[field].localeCompare(current[field]));

module.exports = {
  sortArrayAlphabetically,
};
