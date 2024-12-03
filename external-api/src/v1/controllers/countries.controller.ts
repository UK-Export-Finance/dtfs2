/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */

import { Request, Response } from 'express';
import { sortArrayAlphabetically } from '../../helpers';
import { Country } from '../../interfaces';
import { COUNTRIES } from '../../external-api';

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
