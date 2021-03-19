class Address {
  constructor(address) {
    this.organisation_name = address.organisation_name || null;
    this.address_line_1 = address.address_line_1 || null;
    this.address_line_2 = address.address_line_2 || null;
    this.locality = address.locality || null;
    this.postal_code = address.postal_code || null;
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