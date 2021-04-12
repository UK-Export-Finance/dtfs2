module.exports = {
  createExporterSite: (siteName) => {
    if (!siteName) {
      return false;
    }
    if (siteName === 'statusError') {
      return {
        status: 401,
        data: { error: true },
      };
    }
    return {
      status: 200,
      data: { siteName },
    };
  },
  createBuyerFolder: ({ buyerName }) => ({
    status: 200,
    data: { buyerName },
  }),
  createDealFolder: ({ dealIdentifier }) => (
    {
      status: 200,
      data: { folderName: dealIdentifier },
    }
  ),
  createFacilityFolder: ({ facilityIdentifier }) => {
    if (facilityIdentifier === 'statusError') {
      return Promise.resolve({
        status: 401,
        data: 'status error',
      });
    }
    return Promise.resolve({
      status: 201,
      data: { folderName: facilityIdentifier },
    });
  },
};
