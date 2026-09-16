import { Request, Response } from 'express';
import { CURRENCIES, CurrencyInterface, CustomExpressRequest } from '@ukef/dtfs2-common';
import { sortArrayAlphabetically } from '../../helpers';

const currencies: CurrencyInterface[] = CURRENCIES;

type FindOneCurrencyRequest = CustomExpressRequest<{ params: { id: string } }>;

export const findOneCurrency = (id: string) => currencies.find((c: CurrencyInterface) => c.id.toLowerCase() === id.toLowerCase());

export const findAll = (req: Request, res: Response) =>
  res.status(200).send({
    count: currencies.length,
    currencies: sortArrayAlphabetically(currencies, 'id'),
  });

export const findOne = (req: FindOneCurrencyRequest, res: Response) => {
  const { id } = req.params;
  const currency = findOneCurrency(id);
  const status = currency ? 200 : 404;
  return res.status(status).send(currency);
};
