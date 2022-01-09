import { Request, Response } from 'express';
import * as utils from '../../utils';
import { Currency } from '../../interfaces';
import { CURRENCIES } from '../../reference-data';
const allCurrencies: Currency[] = CURRENCIES;

export const findOneCurrency = (id: any) => allCurrencies.find((c: any) => c.id.toLowerCase() === id.toLowerCase());

export const findAll = (req: Request, res: Response) =>
  res.status(200).send({
    count: allCurrencies.length,
    currencies: utils.sortArrayAlphabetically(allCurrencies, 'id'),
  });

export const findOne = (req: Request, res: Response) => {
  const currency = findOneCurrency(req.params.id);
  const status = currency ? 200 : 404;
  return res.status(status).send(currency);
};
