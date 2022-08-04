const {
  parse,
  getTime,
  startOfDay,
  endOfDay,
} = require('date-fns');

// date format that the endpoint will receive
const DATE_INPUT_FORMAT = 'dd-MM-yyyy';

// Timestamp fields that other systems consume.
// These fields require special date generation/comparison for MongoDB query.
const TIMESTAMP_FIELDS = [
  'dealSnapshot.eligibility.lastUpdated',
  'dealSnapshot.details.submissionDate',
  'dealSnapshot.facilitiesUpdated',
];

const isTimestampField = (fieldName) =>
  TIMESTAMP_FIELDS.includes(fieldName);

const dayStartAndEndTimestamps = (dateString) => {
  // generate date from provided string
  const day = parse(dateString, DATE_INPUT_FORMAT, new Date());

  // generate start of the day timestamp
  const dayStart = startOfDay(new Date(day));
  const dayStartTimestamp = getTime(dayStart);

  // generate end of the day timestamp
  const dayEnd = endOfDay(new Date(day));
  const dayEndTimestamp = getTime(dayEnd);

  const dates = {
    dayStartTimestamp,
    dayEndTimestamp,
  };

  return dates;
};

module.exports = {
  TIMESTAMP_FIELDS,
  isTimestampField,
  DATE_INPUT_FORMAT,
  dayStartAndEndTimestamps,
};
