import { CountryInterface } from './country';
import { CurrencyInterface } from './currency';
import { IndustrySectorInterface } from './industry';

export type UnionCountryCurrencyIndustryInterface = CountryInterface | CurrencyInterface | IndustrySectorInterface;
