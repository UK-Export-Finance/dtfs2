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
  dateOfLastAction: String
  submissionDate: String
  created: String
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

type Transaction {
  deal_id: String
  deal_status: String
  deal_supplierName: String
  deal_bankSupplyContractID: String
  deal_ukefDealId: String
  deal_owningBank: String
  deal_created: String
  deal_submissionDate: String
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
}

type TransactionQuery {
  count: Int,
  transactions: [Transaction]
}

input TransactionFilters {
  field: String
  value: String
  operator: String
}

input TransactionInput {
  start: Int,
  pagesize: Int,
  filters: [TransactionFilters]
}


type Query {
  currencies: [Currency]
  deals(params: DealsInput): DealsQuery
  transactions(params: TransactionInput): TransactionQuery
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
