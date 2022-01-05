const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const SME_TYPE = {
  MICRO: 'Micro',
  SMALL: 'Small',
  MEDIUM: 'Medium',
  NON_SME: 'Non-SME',
  NOT_KNOWN: 'Not known',
};

const EXPIRATION_DATE = {
  NONE: '9999-12-31',
};

const PARTY = {
  GUARANTOR: '00000141',
};

const CURRENCY = {
  DEFAULT: 'GBP',
};

const COUNTRY = {
  DEFAULT: 'GBR',
};

const UNITED_KINGDOM = [
  'united kingdom',
  'england',
  'wales',
  'scotland',
  'northern ireland',
];

module.exports = {
  SME_TYPE,
  SUBMISSION_TYPE,
  EXPIRATION_DATE,
  PARTY,
  CURRENCY,
  COUNTRY,
  UNITED_KINGDOM,
};
