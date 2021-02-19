const typeDefs = `

type StatusType {
  code: Int
  msg: String
}

type OwningBank {
  name: String
  emails: [String]
}

type Maker {
  username: String
  firstname: String
  surname: String,
  email: String,
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
  ukefDealId: String!
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

type FacilityProduct {
  code: String!
  name: String!
}

type Facility {
  _id: String!
  ukefFacilityID: String!
  facilityProduct: FacilityProduct!
  facilityType: String
  ukefFacilityType: String!
  facilityStage: String!
  facilityValueExportCurrency: String!
  facilityValue: String
  coverEndDate: String
  ukefExposure: String!
  coveredPercentage: String!
  bankFacilityReference: String
  guaranteeFeePayableToUkef: String
  bondIssuer: String
  bondBeneficiary: String
}

type DealTotals {
  facilitiesValueInGBP: String
  facilitiesUkefExposure: String
}

type TFMSubmissionDetails {
  supplierPartyUrn: String
}

type TFMData {
  submissionDetails: TFMSubmissionDetails
}

input DashboardFilters {
  field: String
  value: String
  operator: String
}

input DealsInput {
  start: Int,
  pagesize: Int,
  filters: [DashboardFilters]
}

type DealSnapshot {
  _id: String!
  Product: String
  details: DealDetails
  totals: DealTotals
  facilities: [Facility]
  submissionDetails: DealSubmissionDetails
  eligibilityCriteria: [DealEligibilityCriterion!]
  eligibility: DealEligibility
}

type Deal {
  _id: String!
  dealSnapshot: DealSnapshot
  tfm: TFMData
}

type Deals {
  count: Int
  deals: [Deal]
}

type DealsQuery {
  status: StatusType
  count: Int,
  deals: [Deal]
}

type Query {
  deal(_id: ID!): Deal
  deals(params: DealsInput): DealsQuery
  facility(_id: ID!): Facility
}

`;

module.exports = typeDefs;
