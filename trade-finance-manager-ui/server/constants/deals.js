const TFM_SORT_BY = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
};

const TFM_SORT_BY_DEFAULT = {
  field: 'tfm.dateReceivedTimestamp',
  order: TFM_SORT_BY.DESCENDING,
};

module.exports = {
  TFM_SORT_BY,
  TFM_SORT_BY_DEFAULT,
};
