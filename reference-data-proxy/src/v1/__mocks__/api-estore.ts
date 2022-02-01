export const createExporterSite = (siteName: string) => {
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
    status: 201,
    data: { siteName },
  };
};

export const createBuyerFolder = ({ buyerName }: any) => ({
  status: 200,
  data: { buyerName },
});

export const createDealFolder = ({ dealIdentifier }: any) => ({
  status: 200,
  data: { folderName: dealIdentifier },
});

export const createFacilityFolder = ({ facilityIdentifier }: any) => {
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
};
