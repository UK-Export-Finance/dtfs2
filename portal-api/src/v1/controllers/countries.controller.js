const utils = require('../../utils/array');
const externalApi = require('../../external-api/api');

/**
 * Retrieves a country object from an array based on the provided country code.
 *
 * @param {Array} arr - The array of country objects to search in.
 * @param {string} code - The country code to search for.
 * @returns {Array} - The country object matching the provided code, or an empty array if not found.
 */
const getCountryFromArray = (arr, code) => (arr.length ? arr.filter((country) => country.code === code)[0] : []);

/**
 * Sorry countries in alphabetical order with `GBR` always on the top.
 *
 * @param {Array} countries - The array of countries to be sorted.
 * @returns {Array} - The sorted array of countries, error if an exception is caught.
 */
const sortCountries = (countries) => {
  try {
    const countriesWithoutUK = countries.filter((country) => country.code !== 'GBR');

    const sortedArray = [getCountryFromArray(countries, 'GBR'), ...utils.sortArrayAlphabetically(countriesWithoutUK, 'name')];

    return sortedArray;
  } catch (error) {
    console.error('Unable to sort countries %o', error);
    return {
      error,
    };
  }
};

/**
 * Retrieves country information from an external API based on the provided country code.
 *
 * @param {string} code - The country code.
 * @returns {Promise<object>} - A promise that resolves to the country information.
 */
const getCountry = async (code) => {
  try {
    const response = await externalApi.countries.getCountry(code);

    if (!response) {
      throw new Error('Invalid response');
    }

    return response;
  } catch (error) {
    console.error('Unable to get country %o', error);
    return {
      error,
    };
  }
};

/**
 * Function to find one country.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} - A promise that resolves with the response data.
 * @throws {Error} - If unable to find one country.
 */
const findOne = async (req, res) => {
  try {
    const response = await getCountry(req.params.code);

    if (!response) {
      throw new Error('Invalid response');
    }

    const { status, data } = response;

    if (data) {
      return res.status(status).send(data);
    }

    return res.status(status).send({});
  } catch (error) {
    console.error('Unable to find one country %o', error);
    return res.status(500).send({
      status: 500,
      mesage: 'Unable to find one country',
    });
  }
};

/**
 * Find all countries.
 *
 * This function retrieves all countries from an external API and sorts them alphabetically.
 * Please not above is returned with the exception of putting GBR at the top.
 * It returns an object with the count of countries and the sorted array of countries.
 * If there are no countries, it returns an empty array.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} - An object with the count of countries and the sorted array of countries.
 * Status `400` and `500` can also be returned if an exception is caught.
 */
const findAll = async (req, res) => {
  try {
    const countries = await externalApi.countries.getCountries();
    const sortedCountries = sortCountries(countries);

    if (sortCountries.length) {
      return res.status(200).send({
        count: sortedCountries.length,
        countries: sortedCountries,
      });
    }

    return res.status(400).send({
      count: 0,
      countries: [],
    });
  } catch (error) {
    console.error('Unable to find all countries %o', error);
    return res.status(500).send({
      status: 500,
      mesage: 'Unable to find all countries',
    });
  }
};

module.exports = {
  getCountry,
  findAll,
  findOne,
};
