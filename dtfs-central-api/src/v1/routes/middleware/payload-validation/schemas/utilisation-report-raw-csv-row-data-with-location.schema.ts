import z from 'zod';

const UtilisationReportRawCsvCellDataWithLocationSchema = z.object({
  value: z.string().nullable(),
  column: z.string(),
  row: z.union([z.string(), z.number()]),
});

export const UtilisationReportRawCsvRowDataWithLocationsSchema = z.record(UtilisationReportRawCsvCellDataWithLocationSchema);
