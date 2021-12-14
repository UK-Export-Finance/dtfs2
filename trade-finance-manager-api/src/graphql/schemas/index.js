const typeDefs = `

type StatusType {
  code: Int
  msg: String
}

type Country {
  code: String
  name: String
}

type Bank {
  name: String
  emails: [String]
  partyUrn: String
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
  ukefDealId: String
  checker: Checker
  checkerMIN: Checker
  submissionDate: String
  manualInclusionNoticeSubmissionDate: String
  approvalDate: String
  created: String
  workflowStatus: String
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
  supplierType: String,
  smeType: String
}

type DealFiles {
  security: String
}

type DealExporter {
  companyName: String
}

type DealEligibilityCriterion {
  id: Int
  text: String
  textList: [String]
  answer: String
}

type DealEligibility {
  criteria: [DealEligibilityCriterion!]
  agentAddressCountry: Country
  agentAddressLine1: String
  agentAddressLine2: String
  agentAddressLine3: String
  agentAddressPostcode: String
  agentAddressTown: String
  agentName: String
  agentAlias: String
  lastUpdated: Float
}

type FacilityProduct {
  code: String
  name: String
}

type FacilityDates {
  inclusionNoticeReceived: String
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
  ukefFacilityId: String
  dealId: String!
  facilityProduct: FacilityProduct!
  facilityType: String
  ukefFacilityType: String!
  facilityStage: String!
  facilityValueExportCurrency: String!
  value: String
  currency: String
  coveredPercentage: String!
  bankFacilityReference: String
  guaranteeFeePayableToUkef: String
  banksInterestMargin: String
  bondIssuer: String
  bondBeneficiary: String
  ukefExposure: String
  firstDrawdownAmountInExportCurrency: String
  feeType: String
  feeFrequency: String
  dayCountBasis: Int
  dates: FacilityDates
  providedOn: [String]
  providedOnOther: String
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

type TFMEstore {
  siteName:String
  buyerName: String
  folderName: String
}

type TFMTeam {
  id: String
  name: String
}

type TFMTaskAssignedTo {
  userId: String
  userFullName: String
}

type TFMTask {
  id: String
  groupId: Int
  title: String
  status: String
  previousStatus: String
  team: TFMTeam
  assignedTo: TFMTaskAssignedTo
  canEdit: Boolean
  lastEdited: String
  history: [TFMTaskHistory]
  dateStarted: String
  dateCompleted: String
}

type TFMTaskGroup {
  groupTitle: String
  id: Int
  groupTasks: [TFMTask]
}

type TFMTaskHistory {
  taskId: String
  groupId: String
  statusFrom: String
  statusTo: String
  assignedUserId: String
  updatedBy: String
  timestamp: String
}

type TFMEmailHistory {
  recipient: String
  templateId: String
  timestamp: String
}

type TFMDealHistory {
  tasks: [TFMTaskHistory]
  emails: [TFMEmailHistory]
}

type TFMDealDecision  {
  decision: String
  comments: String
  internalComments: String
  userFullName: String
  timestamp: String
}
type TFMAuthor {
  firstName: String
  lastName: String
  _id: String
}
type TFMActivity {
  type: String
  timestamp: Int
  text: String
  author: TFMAuthor
  label: String
}
type TFMDealData {
  parties: TFMParties
  product: String
  tasks: [TFMTaskGroup]
  exporterCreditRating: String
  supplyContractValueInGBP: String
  stage: String
  lossGivenDefault: Int
  probabilityOfDefault: Float
  history: TFMDealHistory
  underwriterManagersDecision: TFMDealDecision
  dateReceived: String
  estore: TFMEstore
  leadUnderwriter: String
  activities: [TFMActivity]
}

type PremiumScheduleData {
  id: Int
  facilityURN: String
  calculationDate: String
  income: Float
  incomePerDay: Float
  exposure: Int
  period: Int
  daysInPeriod: Int
  effectiveFrom: String
  effectiveTo: String
  created: String
  updated: String
  isAtive: String
}

type TFMFacilityData {
  bondIssuerPartyUrn: String
  bondBeneficiaryPartyUrn: String
  facilityValueInGBP: String
  exposurePeriodInMonths: Int
  ukefExposure: FacilityUkefExposure
  creditRating: String
  riskProfile: String
  premiumSchedule: [PremiumScheduleData]
  premiumTotals: String
  hasBeenAcknowledged: Boolean
  feeRecord: Float
}

input TasksFilters {
  filterType: String
  userId: String
  teamId: String
}

input ActivityFilters {
  filterType: String
}

input DealInput {
  _id: String!
  tasksFilters: TasksFilters
  activityFilters: ActivityFilters
}

input DealsSortBy {
  field: String
  order: String
}

input DealsByField {
  name: String
  value: String
}

input DealsInput {
  start: Int
  pagesize: Int
  searchString: String
  sortBy: DealsSortBy
  byField: [DealsByField]
}

input FacilitiesInput {
   searchString: String
}

type DealSnapshot {
  _id: String!
  dealType: String!
  submissionType: String
  bankInternalRefName: String
  additionalRefName: String
  updatedAt: Float
  status: String
  bank: Bank
  maker: Maker
  details: DealDetails
  totals: DealTotals
  facilities: [Facility]
  submissionDetails: DealSubmissionDetails
  isFinanceIncreasing: Boolean
  eligibility: DealEligibility
  dealFiles: DealFiles
  exporter: DealExporter
  facilitiesUpdated: Float
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

type DealSnapshotFacilities {
   applicationId: String!
   facilityId: String!
   ukefFacilityId: String!
   dealType: String!
   facilityType: String!
   facilityValue: String!
   coverEndDate: String
   companyName: String!
   hasBeenIssued: Boolean!
   currency: String!
}

type FacilitiesQuery {
   tfmFacilities: [DealSnapshotFacilities]
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

input TFMTaskAssignedToInput {
  userId: String
}

input TFMTaskInput {
  id: String
  groupId: Int
  assignedTo: TFMTaskAssignedToInput
  status: String
  updatedBy: String
  urlOrigin: String
}

input TFMCreditRatingInput {
  exporterCreditRating: String
}

input TFMLossGivenDefaultInput {
  lossGivenDefault: Int
}

input TFMProbabilityOfDefaultInput {
  probabilityOfDefault: Int
}

input TFMFacilityRiskProfileInput {
  riskProfile: String
}

input TFMUnderwriterManagersDecisionInput {
  decision: String
  comments: String
  internalComments: String
  userFullName: String
}

input TFMLeadUnderwriterInput {
  userId: String
}

input TFMAuthorInput {
  firstName: String
  lastName: String
  _id: String
}

input TFMActivityInput {
  type: String
  timestamp: Int
  text: String
  author: TFMAuthorInput
  label: String
}

type TeamMember {
  _id: String
  firstName: String
  lastName: String
}

type User {
  _id: String
  firstName: String
  lastName: String
  email: String
}

type Query {
  deal(params: DealInput): Deal
  deals(params: DealsInput): DealsQuery
  dealsLight(params: DealsInput): DealsQuery
  facility(_id: ID!): Facility
  facilities(params: FacilitiesInput): FacilitiesQuery
  teamMembers(teamId: String!): [TeamMember]
  user(userId: String!): User
}

type Mutation {
  updateParties(_id: ID!, partyUpdate: TFMPartiesInput): TFMDealData
  updateFacility(_id: ID!, facilityUpdate: TFMFacilityInput): TFMFacilityData
  updateTask(dealId: ID!, taskUpdate: TFMTaskInput): TFMTask
  updateCreditRating(dealId: ID!, creditRatingUpdate: TFMCreditRatingInput): TFMDealData
  updateLossGivenDefault(dealId: ID!, lossGivenDefaultUpdate: TFMLossGivenDefaultInput): TFMDealData
  updateProbabilityOfDefault(dealId: ID!, probabilityOfDefaultUpdate: TFMProbabilityOfDefaultInput): TFMDealData
  updateFacilityRiskProfile(_id: ID!, facilityUpdate: TFMFacilityRiskProfileInput): TFMFacilityData
  updateUnderwriterManagersDecision(dealId: ID!, managersDecisionUpdate: TFMUnderwriterManagersDecisionInput): TFMDealData
  updateLeadUnderwriter(dealId: ID!, leadUnderwriterUpdate: TFMLeadUnderwriterInput): TFMDealData
  createActivity(dealId: ID!, activityUpdate: TFMActivityInput): TFMDealData
}
`;

module.exports = typeDefs;
