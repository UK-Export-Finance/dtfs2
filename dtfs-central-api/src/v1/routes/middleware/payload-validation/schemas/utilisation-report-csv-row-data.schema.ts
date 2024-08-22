import z from 'zod';

const UtilisationReportCsvCellDataSchema = z.object({
  value: z.string().nullable(),
  column: z.string(),
  row: z.union([z.string(), z.number()]),
});

export const UtilisationReportCsvRowDataSchema = z.record(z.string(), UtilisationReportCsvCellDataSchema);
