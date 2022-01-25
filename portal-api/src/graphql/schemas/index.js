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

type Bank {
  id: String
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

type ErrorListItem {
  order: String
  text: String
}

type AllDeal {
  _id: String!
  status: String
  bankInternalRefName: String
  exporter: String
  product: String
  submissionType: String
  updatedAt: Float
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
  value: [String]
  operator: String
}

input DealsInput {
  start: Int
  pagesize: Int
  filters: [DashboardFilters]
  sort: [DashboardSort]
}

input FacilitiesInput {
  start: Int
  pagesize: Int
  filters: [DashboardFilters]
  sort: [DashboardSort]
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
  text: String
  errMsg: String
  answer: Boolean
}

type Eligibility {
  lastUpdated: Int
  criteria: [EligibilityCriterion]
}

type GefDeal {
  _id: String
  maker: Maker
  status: String
  bank: Bank
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

type Facility {
  _id: String
  name: String
  dealId: String
  ukefFacilityId: String
  type: String
  submissionType: String
  currency: Currency
  value: Float
  hasBeenIssued: Boolean
  submittedAsIssuedDate: Float
}

type AllFacilitiesQuery {
  count: Int
  facilities: [Facility]
}

type Query {
  currencies: [Currency]
  allDeals(params: DealsInput): AllDealsQuery
  allFacilities(params: FacilitiesInput): AllFacilitiesQuery
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
