/**
 * In generate app in our api services we set a limit to express.json
 * for the max size of the request body to override the default of 100kb
 * for the utilisation report upload endpoint we set a limit of 5mb
 */
export const MAX_REQUEST_SIZE = '500kb';
export const MAX_UTILISATION_REPORT_REQUEST_SIZE = '5mb';
