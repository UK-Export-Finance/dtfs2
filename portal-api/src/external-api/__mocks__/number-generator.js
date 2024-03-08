const { NUMBER } = require('../../constants');

const getNumber = async () => ({
  data: {
    status: 200,
    data: [
      {
        id: 12345678,
        maskedId: NUMBER.UKEF_ID.TEST,
        type: 1,
        createdBy: NUMBER.USER.DTFS,
        createdDatetime: '2024-01-01T00:00:00.000Z',
        requestingSystem: NUMBER.USER.DTFS,
      },
    ],
  },
});

module.exports = {
  getNumber,
};
