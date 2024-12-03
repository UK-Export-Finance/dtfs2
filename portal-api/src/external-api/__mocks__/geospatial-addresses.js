const getAddressesByPostcode = async () => ({
  status: 200,
  data: [
    {
      organisationName: null,
      addressLine1: '95 PORTLAND STREET',
      addressLine2: null,
      addressLine3: null,
      locality: 'LONDON',
      postalCode: 'SE17 2NR',
      country: 'England',
    },
    {
      organisationName: null,
      addressLine1: '97 PORTLAND STREET',
      addressLine2: null,
      addressLine3: null,
      locality: 'LONDON',
      postalCode: 'SE17 2NR',
      country: 'England',
    },
  ],
});

module.exports = {
  getAddressesByPostcode,
};
