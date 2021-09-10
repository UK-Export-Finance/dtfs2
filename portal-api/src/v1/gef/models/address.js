class Address {
  constructor(address) {
    this.organisationName = address.organisationName || null;
    this.addressLine1 = address.addressLine1 || null;
    this.addressLine2 = address.addressLine2 || null;
    this.addressLine3 = address.addressLine3 || null;
    this.locality = address.locality || null;
    this.postalCode = address.postalCode || null;
    this.country = address.country || null;
  }
}
module.exports = {
  Address,
};

// class Address {
//   constructor(address) {
//     this.organisationName = address.organisation_name || null;
//     this.addressLine1 = address.address_line_1 || null;
//     this.addressLine2 = address.address_line_2 || null;
//     this.addressLine3 = address.address_line_3 || null;
//     this.locality = address.locality || null;
//     this.postalCode = address.postal_code || null;
//     this.country = address.country || null;
//   }
// }

// module.exports = {
//   Address,
// };
