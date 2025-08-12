export const isNotValidNumber = (value: number | null | undefined) => !value || Number.isNaN(value) || typeof value !== 'number';
