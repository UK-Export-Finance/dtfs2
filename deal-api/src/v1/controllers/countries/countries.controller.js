const sortedCountries = require('./sortedCountries')();

// left in weird async/callback form as this is being used from other controllers as-is..
const findOneCountry = async (code, callback) => {
  const result = sortedCountries.find((country) => country.code === code);
  if (typeof callback === 'function') {
    return callback(result);
  }
  return result;
};
exports.findOneCountry = findOneCountry;

exports.findAll = (req, res) => (
  res.status(200).send({
    count: sortedCountries.length,
    countries: sortedCountries,
  })
);

exports.findOne = (req, res) => (
  findOneCountry(req.params.code, (country) => res.status(200).send(country))
);
