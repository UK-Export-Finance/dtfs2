const typeDefs = `

type StatusType {
  code: Int
  msg: String
}

type Country {
  code: String
  name: String
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
  legallyDistinct: String,
  indemnifierCompaniesHouseRegistrationNumber: String,
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
  agentAddressCountry: Country
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

type FacilityDates {
  inclusionNoticeReceived: String!
  bankIssueNoticeReceived: String
  coverStartDate: String
  coverEndDate: String
  tenor: String
}

type FacilityUkefExposure {
  exposure: String
  timestamp: String
}

type FacilitySnapshot {
  _id: String!
  ukefFacilityID: String!
  associatedDealId: String!
  facilityProduct: FacilityProduct!
  facilityType: String
  ukefFacilityType: String!
  facilityStage: String!
  facilityValueExportCurrency: String!
  facilityValue: String
  coveredPercentage: String!
  bankFacilityReference: String
  guaranteeFeePayableToUkef: String
  banksInterestMargin: String
  bondIssuer: String
  bondBeneficiary: String
  ukefExposure: String
  firstDrawdownAmountInExportCurrency: String
  dates: FacilityDates,
  feeType: String,
  feeFrequency: String,
  dayCountBasis: Int
}

type Facility {
  _id: String!
  facilitySnapshot: FacilitySnapshot
  tfm: TFMFacilityData
}

type DealTotals {
  facilitiesValueInGBP: String
  facilitiesUkefExposure: String
}

type TFMParty {
  partyUrn: String
  partyUrnRequired: Boolean
}

type TFMAgent {
  partyUrn: String
  partyUrnRequired: Boolean
  commissionRate: String
}

type TFMParties {
  exporter: TFMParty
  buyer: TFMParty
  indemnifier: TFMParty
  agent: TFMAgent
}

type TFMTeam {
  id: String
  name: String
}

type TFMTask {
  id: String
  title: String
  status: String
  team: TFMTeam
}

type TFMDealData {
  parties: TFMParties
  product: String
  tasks: [TFMTask]
}

type TFMFacilityData {
  bondIssuerPartyUrn: String
  bondBeneficiaryPartyUrn: String
  facilityValueInGBP: String
  exposurePeriodInMonths: Int
  ukefExposure: FacilityUkefExposure
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
  tfm: TFMDealData
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


input TFMPartyInput {
  partyUrn: String
  partyUrnRequired: Boolean
}

input TFMAgentInput {
  partyUrn: String
  partyUrnRequired: String
  commissionRate: String
}

input TFMPartiesInput {
  exporter: TFMPartyInput
  indemnifier: TFMPartyInput
  buyer: TFMPartyInput
  agent: TFMAgentInput
}

input TFMFacilityInput {
  bondIssuerPartyUrn: String
  bondBeneficiaryPartyUrn: String
}

type Query {
  deal(_id: ID!): Deal
  deals(params: DealsInput): DealsQuery
  facility(_id: ID!): Facility
}

type Mutation {
  updateParties(_id: ID!, partyUpdate: TFMPartiesInput): TFMDealData
  updateFacility(_id: ID!, facilityUpdate: TFMFacilityInput): TFMFacilityData
}
`;

module.exports = typeDefs;
