const { NODE_ENV } = process.env;

/**
 * Checks if the code is running in a production environment.
 * @returns {boolean} - Returns true if the code is running in a production environment, false otherwise.
 */
const isProduction = () => NODE_ENV === 'production';

module.exports = isProduction;
