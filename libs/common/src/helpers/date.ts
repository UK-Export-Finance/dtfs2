import { formatISO } from 'date-fns';

export const getNowAsISOString = () => formatISO(new Date());
