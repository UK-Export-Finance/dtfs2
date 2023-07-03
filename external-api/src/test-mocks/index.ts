import { Request, Response } from 'express';

export const mockReq = () =>
  ({
    headers: {},
  } as Request);

export const mockRes = () => {
  const res = {} as Response;

  res.send = jest.fn();
  res.status = jest.fn(() => res);

  return res;
};

export const mockNext = jest.fn();
