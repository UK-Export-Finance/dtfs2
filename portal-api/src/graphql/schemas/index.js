const typeDefs = `

type StatusType {
  code: Int
  msg: String
}

type Currency {
  currencyId: Int!
  text: String
  id: String
}

type OwningBank {
  name: String
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

type ErrorListItem {
  order: String
  text: String
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

type Deal {
  _id: String!
  details: DealDetails
}

type AllDeal {
  _id: String!
  status: String
  bankRef: String
  exporter: String
  product: String
  type: String
  lastUpdate: Float
}

type DealsQuery {
  status: StatusType
  count: Int
  deals: [Deal]
}

type AllDealsQuery {
  status: StatusType
  count: Int
  deals: [AllDeal]
}

input DashboardSort {
  field: String
  order: Int
}

input DashboardFilters {
  field: String
  value: String
  operator: String
}

input DealsInput {
  start: Int
  pagesize: Int
  filters: [DashboardFilters]
  sort: [DashboardSort]
}

type Transaction {
  deal_id: String
  deal_status: String
  deal_supplierName: String
  deal_bankSupplyContractID: String
  deal_ukefDealId: String
  deal_owningBank: String
  deal_created: String
  deal_submissionDate: String
  deal_submissionType: String
  transaction_id: String
  bankFacilityId: String
  ukefFacilityId: String
  transactionType: String
  facilityValue: String
  transactionStage: String
  createdDate: String
  lastEdited: String
  issuedDate: String
  maker: String
  checker: String
  issueFacilityDetailsSubmitted: String
  currency: Currency
  requestedCoverStartDate: String
  previousCoverStartDate: String
  dateOfCoverChange: String
  issuedFacilitySubmittedToUkefTimestamp: String
  issuedFacilitySubmittedToUkefBy: String
}

type TransactionQuery {
  count: Int
  transactions: [Transaction]
}

input TransactionFilters {
  field: String
  value: String
  operator: String
}

input TransactionInput {
  start: Int
  pagesize: Int
  filters: [TransactionFilters]
}

type Exporter {
  _id: String
  companiesHouseRegistrationNumber: String
  companyName: String
  registeredAddress: String
  correspondenceAddress: String
  selectedIndustry: String
  industries: String,
  smeType: String
  probabilityOfDefault: Float
  isFinanceIncreasing: Boolean
  createdAt: Float
  updatedAt: Float
}

type EligibilityCriterion {
  id: Int
  name: String
  htmlText: String
  errMsg: String
  answer: Boolean
}

type Eligibility {
  lastUpdated: Int
  criteria: [EligibilityCriterion]
}

type GefDeal {
  _id: String
  userId: String
  status: String
  bankId: String
  exporterId: String
  bankInternalRefName: String
  mandatoryVersionId: String
  additionalRefName: String
  submissionCount: String
  submissionDate: Float
  submissionType: String
  ukefDealId: String
  checkerId: String
  createdAt: Float
  updatedAt: Float
  exporter: Exporter
  eligibility: Eligibility
}

type GefDealsQuery {
  count: Int
  deals: [GefDeal]
}

type GefFacility {
  _id: String
  applicationId: String
  type: String
  hasBeenIssued: Boolean
  name: String
  shouldCoverStartOnSubmission: String
  coverStartDate: Float
  coverEndDate: Float
  monthsOfCover: Int
  details: String
  detailsOther: String
  currency: String
  value: Float
  coverPercentage: Float
  interestPercentage: Float
  paymentType: String
  ukefExposure: Float
  submittedAsIssuedDate: Float
  ukefFacilityId: String
  createdAt: Float
  updatedAt: Float
  deal: GefDeal
}

type GefFacilitiesQuery {
  count: Int
  facilities: [GefFacility]
}

type Query {
  currencies: [Currency]
  allDeals(params: DealsInput): AllDealsQuery
  deals(params: DealsInput): DealsQuery
  gefDeals(params: DealsInput): GefDealsQuery
  transactions(params: TransactionInput): TransactionQuery
  gefFacilities(params: TransactionInput): GefFacilitiesQuery
}

type DealStatusErrorItem {
  comments: ErrorListItem
  confirmSubmit: ErrorListItem
}

type DealStatusUpdateResult {
  statusCode: Int
  status: String
  comments: String
  success: Boolean
  count: Int
  errorList: DealStatusErrorItem
}

type Mutation {
  dealStatusUpdate( dealId: String, status: String, comments: String): DealStatusUpdateResult
}
`;

module.exports = typeDefs;
