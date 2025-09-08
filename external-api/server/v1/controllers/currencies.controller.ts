import { Request, Response } from 'express';
import { CURRENCIES, CurrencyInterface } from '@ukef/dtfs2-common';
import { sortArrayAlphabetically } from '../../helpers';

const currencies: CurrencyInterface[] = CURRENCIES;

export const findOneCurrency = (id: string) => currencies.find((c: CurrencyInterface) => c.id.toLowerCase() === id.toLowerCase());

export const findAll = (req: Request, res: Response) =>
  res.status(200).send({
    count: currencies.length,
    currencies: sortArrayAlphabetically(currencies, 'id'),
  });

export const findOne = (req: Request, res: Response) => {
  const currency = findOneCurrency(req.params.id);
  const status = currency ? 200 : 404;
  return res.status(status).send(currency);
};
