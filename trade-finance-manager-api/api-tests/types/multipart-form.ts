type FormValues = (string | number | boolean | Buffer) | Array<string | number | boolean | Buffer>;

export type MultipartForm = Record<string, FormValues>;
