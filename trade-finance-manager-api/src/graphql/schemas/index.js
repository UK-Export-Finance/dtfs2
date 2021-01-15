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
  buyerName: String,
  buyerAddressCountry: String,
  buyerAddressLine1: String,
  buyerAddressLine2: String,
  buyerAddressLine3: String,
  buyerAddressPostcode: String,
  buyerAddressTown: String,
  destinationCountry: String,
  indemnifierAddressCountry: String
  indemnifierAddressLine1: String,
  indemnifierAddressLine2: String,
  indemnifierAddressLine3: String,
  indemnifierAddressPostcode: String,
  indemnifierAddressTown: String,
  indemnifierCorrespondenceAddressCountry: String,
  indemnifierCorrespondenceAddressLine1: String,
  indemnifierCorrespondenceAddressLine2: String,
  indemnifierCorrespondenceAddressLine3: String,
  indemnifierCorrespondenceAddressPostcode: String,
  indemnifierCorrespondenceAddressTown: String,
  indemnifierName: String,
  industryClass: String,
  industrySector: String,
  supplierAddressCountry: String,
  supplierCountry: String,
  supplierAddressLine1: String,
  supplierAddressLine2: String,
  supplierAddressLine3: String,
  supplierAddressPostcode: String,
  supplierAddressTown: String,
  supplierCompaniesHouseRegistrationNumber: String,
  supplierCorrespondenceAddressCountry: String,
  supplierCorrespondenceAddressLine1: String,
  supplierCorrespondenceAddressLine2: String,
  supplierCorrespondenceAddressLine3: String,
  supplierCorrespondenceAddressPostcode: String,
  supplierCorrespondenceAddressTown: String,
  supplierAddress: String,
  smeType: String
}

type DealEligibilityCriterion {
  _id: String
  id: Int
  description: String
  descriptionList: [String]
  answer: String
}

type DealEligibility {
  agentAddressCountry: String
  agentAddressLine1: String
  agentAddressLine2: String
  agentAddressLine3: String
  agentAddressPostcode: String
  agentAddressTown: String
  agentName: String
  agentAlias: String
}

type Facility  {
  _id: String!
  facilityProduct: String!
  facilityType: String
  facilityValue: String
  coverEndDate: String!
  ukefExposure: String!
  coveredPercentage: String!
}

type Deal {
  _id: String!
  details: DealDetails
  facilities: [Facility]
  submissionDetails: DealSubmissionDetails
  eligibilityCriteria: [DealEligibilityCriterion!]
  eligibility: DealEligibility
}

type Query {
  deal(_id: ID!): Deal
}
`;

module.exports = typeDefs;
