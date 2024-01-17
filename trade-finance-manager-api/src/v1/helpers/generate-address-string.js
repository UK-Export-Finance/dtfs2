const generateCleanAddressArray = (addressObj) => Object.values(addressObj).filter((value) => value);

const generateAddressString = (addressObj) => {
  let addressString = '';

  // some address values can be null - filter these out.
  const cleanValues = generateCleanAddressArray(addressObj);

  const totalValues = cleanValues.length;

  cleanValues.forEach((str, index) => {
    if (index + 1 !== totalValues) {
      // only add a comma and space if it's the NOT the last item
      addressString += `${str}, `;
    } else {
      addressString += str;
    }
  });

  return addressString;
};

module.exports = {
  generateCleanAddressArray,
  generateAddressString,
};
