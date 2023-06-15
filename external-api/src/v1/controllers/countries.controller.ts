import { Request, Response } from 'express';
import { sortArrayAlphabetically } from '../../utils';
import { Country } from '../../interfaces';
import { COUNTRIES } from '../../reference-data';

const allCountries: Country[] = COUNTRIES;

const getCountryFromArray = (arr: any, code: any) => arr.filter((country: any) => country.code.toLowerCase() === code.toLowerCase())[0];

const sortCountries = () => {
  const countriesWithoutUK = allCountries.filter((country: any) => country.code !== 'GBR');
  const sortedArray = [getCountryFromArray(COUNTRIES, 'GBR'), ...sortArrayAlphabetically(countriesWithoutUK, 'name')];
  return sortedArray;
};

export const findOneCountry = (findCode: any) => allCountries.find(({ code }: any) => code.toLowerCase() === findCode.toLowerCase());

export const findAll = (req: Request, res: Response) => {
  const sortedCountries = sortCountries();
  res.status(200).send({
    count: sortedCountries.length,
    countries: sortedCountries,
  });
};

export const findOne = (req: Request, res: Response) => {
  const country = findOneCountry(req.params.code);
  const status = country ? 200 : 404;
  res.status(status).send(country);
};
