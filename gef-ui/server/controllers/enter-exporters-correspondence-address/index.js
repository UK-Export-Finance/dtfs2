
// import _isEmpty from 'lodash/isEmpty';
// import { selectDropdownAddresses, validationErrorHandler } from '../../utils/helpers';

const enterExportersCorrespondenceAddress = (req, res) => {
  const { params, session } = req;
  const { applicationId } = params;
  const { address } = session;
  const parseAddress = JSON.parse(address);

  return res.render('partials/enter-exporters-correspondence-address.njk', {
    addressForm: parseAddress,
    applicationId,
  });
};

// const validateEnterExportersCorrespondenceAddress = (req, res) => {
//   const { params, body, session } = req;
//   const { postcode, addresses } = session;
//   const { selectedAddress } = body;
//   const { applicationId } = params;
//   const parseAddresses = JSON.parse(addresses);
//   let selectedAddressError;

//   if (_isEmpty(selectedAddress)) {
//     selectedAddressError = {
//       errRef: 'selectedAddress',
//       errMsg: 'Select an address',
//     };

//     return res.render('partials/select-exporters-correspondence-address.njk', {
//       errors: validationErrorHandler(selectedAddressError),
//       addressesForSelection: selectDropdownAddresses(parseAddresses),
//       postcode,
//       applicationId,
//     });
//   }

//   req.session.address = parseAddresses[parseFloat(selectedAddress)];
//   req.session.confirm = true;

//   return res.redirect(`/gef/application-details/${applicationId}/enter-exporters-correspondence-address`);
// };

export {
  enterExportersCorrespondenceAddress,
  // validateEnterExportersCorrespondenceAddress,
};
