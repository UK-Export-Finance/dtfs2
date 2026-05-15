import { PRODUCT_TYPE_CODES } from '../constants';

export type ProductTypeCode = (typeof PRODUCT_TYPE_CODES)[keyof typeof PRODUCT_TYPE_CODES];
