import gql from 'graphql-tag';

const dealQuery = `
query Deal {
  deal {
    _id,
    details {
      status,
      submissionType,
      owningBank {
        name,
        emails
      }
    }
    submissionDetails {
      supplierName,
      supplyContractDescription,
      destinationCountry
    }
  }
}`;

export default gql(dealQuery);
