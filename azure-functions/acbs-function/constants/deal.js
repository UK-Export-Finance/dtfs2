const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const SME_TYPE = {
  MICRO: 'micro',
  SMALL: 'small',
  MEDIUM: 'medium',
  NON_SME: 'non-sme',
  NOT_SME: 'not sme',
  NOT_KNOWN: 'not known',
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

const EXPORTER_CREDIT_RATING = {
  B_PLUS: 'Acceptable (B+)',
  BB_MINUS: 'Good (BB-)',
};

module.exports = {
  SME_TYPE,
  SUBMISSION_TYPE,
  EXPIRATION_DATE,
  PARTY,
  CURRENCY,
  COUNTRY,
  UNITED_KINGDOM,
  EXPORTER_CREDIT_RATING,
};
