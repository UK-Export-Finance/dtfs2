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
  checker: String
  dateOfLastAction: String
  submissionDate: String
  owningBank: OwningBank
}

type Deal {
  _id: String!
  details: DealDetails
}

type DealsQuery {
  status: StatusType
  count: Int,
  deals: [Deal]
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

type Query {
  currencies: [Currency]
  deals(params: DealsInput): DealsQuery
}

type DealStatusErrorItem {
  comments: ErrorListItem,
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
