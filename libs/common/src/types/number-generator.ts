import { IsoDateTimeStamp } from './date';

/**
 * Defines the structure of a number generator object.
 *
 * @interface NumberGeneratorObject
 * @property id - The ID of the generated number.
 * @property maskedId - The masked ID of the generated number.
 * @property type - The type of the generated number.
 * @property createdBy - The creator of the generated number.
 * @property createdDatetime - The creation datetime of the generated number.
 * @property requestingSystem - The system that requested the generation of the number.
 */
export interface NumberGeneratorObject {
  id: number;
  maskedId: string;
  type: number;
  createdBy: string;
  createdDatetime: IsoDateTimeStamp;
  requestingSystem: string;
}

/**
 * Defines the interfaces for the response of the number generator.
 *
 * @interface NumberGeneratorResponse
 * @property status - The status code of the response.
 * @property data - An array of NumberGeneratorObject objects containing the generated numbers.
 */
export interface NumberGeneratorResponse {
  readonly status: number;
  readonly data: Array<NumberGeneratorObject>;
}
