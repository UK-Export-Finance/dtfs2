import { CustomerType } from '../..';

/**
 * Represents a party entity in Salesforce with relevant company details.
 *
 * @property companyRegNo - The registration number of the company.
 * @property companyName - The name of the company.
 * @property probabilityOfDefault - The probability that the company will default.
 * @property isUkEntity - Indicates if the company is a UK entity.
 * @property code - A numeric code associated with the party.
 */
export type SalesForceParty = {
  code: number;
  companyRegNo: string;
  companyName: string;
  customerType: CustomerType;
  isUkEntity: boolean;
  probabilityOfDefault: number;
};
