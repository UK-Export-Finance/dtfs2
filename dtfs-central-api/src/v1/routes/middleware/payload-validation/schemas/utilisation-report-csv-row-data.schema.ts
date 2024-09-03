import z from 'zod';

const UtilisationReportCsvCellDataSchema = z.object({
  value: z.string().nullable(),
  column: z.string(),
  row: z.union([z.string(), z.number()]),
});

/**
 * Schema to validate if the passed in object is a valid utilisation report csv row data
 */
export const UtilisationReportCsvRowDataSchema = z.record(z.string(), UtilisationReportCsvCellDataSchema);
