const generateHeadingText = (count, submittedValue, collectionName) => {
  if (submittedValue) {
    if (count === 1) {
      return `${count} result for "${submittedValue}"`;
    }
    if (count > 1) {
      return `${count} results for "${submittedValue}"`;
    }

    return `0 results for "${submittedValue}"`;
  }

  return `All ${collectionName}`;
};

module.exports = { generateHeadingText };
