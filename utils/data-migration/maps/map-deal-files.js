const hasError = false;

const mapDealFiles = (portalDealId, v1Deal) => {
  const { Deal_information: { Exporter_and_indemnifier: exporterInfo } } = v1Deal;

  const dealFiles = {
    security: exporterInfo.Bank_security,
  };

  return [
    dealFiles,
    hasError,
  ];
};

module.exports = mapDealFiles;
