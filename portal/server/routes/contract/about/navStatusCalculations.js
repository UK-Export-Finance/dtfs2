const calculateStatusOfEachPage = (errors) => {
  const supplierPageIsValid = () => {
    if (!errors.length) return true;

    const anyErrorsStartWithSupplier = errors.reduce((result, error) => result || error.startsWith('supplier'), false);
    if (anyErrorsStartWithSupplier) {
      return false;
    }

    const anyErrorsStartWithIndemnifier = errors.reduce((result, error) => result || error.startsWith('indemnifier'), false);
    if (anyErrorsStartWithIndemnifier) {
      return false;
    }

    if (
      errors.includes('industry-class') ||
      errors.includes('industry-selector') ||
      errors.includes('legallyDistinct') ||
      errors.includes('sme-type') ||
      errors.includes('supply-contract-description')
    ) {
      return false;
    }

    return true;
  };

  const buyerPageIsValid = () => {
    if (!errors.length) return true;

    const anyErrorsStartWithBuyer = errors.reduce((result, error) => result || error.startsWith('buyer'), false);
    if (anyErrorsStartWithBuyer) {
      return false;
    }

    if (errors.includes('destinationOfGoodsAndServices')) {
      return false;
    }

    return true;
  };

  const financialPageIsValid = () => {
    if (!errors.length) return true;

    if (
      errors.includes('supplyContractValue') ||
      errors.includes('supplyContractCurrency') ||
      errors.includes('supplyContractConversionRateToGBP') ||
      errors.includes('supplyContractValue')
    ) {
      return false;
    }

    const anyErrorsToDoWithConversionDate = errors.reduce((result, error) => result || error.startsWith('supplyContractConversionDate'), false);
    if (anyErrorsToDoWithConversionDate) {
      return false;
    }

    return true;
  };

  return {
    supplierAndGuarantor: supplierPageIsValid(),
    buyer: buyerPageIsValid(),
    financialInformation: financialPageIsValid(),
  };
};

module.exports = calculateStatusOfEachPage;
