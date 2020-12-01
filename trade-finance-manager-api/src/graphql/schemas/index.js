const typeDefs = `

type OwningBank {
  name: String
  emails: [String]
}

type Maker {
  username: String
  firstname: String
  surname: String
}

type Checker {
  username: String
  firstname: String
  surname: String
}

type DealDetails {
  status: String
  bankSupplyContractID: String
  bankSupplyContractName: String
  ukefDealId: String
  submissionType: String
  maker: Maker
  checker: Checker
  checkerMIN: Checker
  dateOfLastAction: String
  submissionDate: String
  approvalDate: String
  created: String
  workflowStatus: String
  owningBank: OwningBank
}

type DealSubmissionDetails {
  supplierName: String
  supplyContractDescription: String
  supplyContractCurrency: String
  supplyContractValue: String
  buyerName: String
  destinationCountry: String
}

type Deal {
  _id: String!
  details: DealDetails
  submissionDetails: DealSubmissionDetails
}

type Query {
  deal(_id: ID!): Deal
}
`;

module.exports = typeDefs;
