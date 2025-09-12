import { Request, Response } from 'express';

export const mockReq = () => {
  const req = {
    headers: {},
  } as Request;

  return req;
};

export const mockRes = () => {
  const res = {} as Response;

  res.send = jest.fn();
  res.status = jest.fn(() => res);

  return res;
};

export const mockNext = jest.fn();
