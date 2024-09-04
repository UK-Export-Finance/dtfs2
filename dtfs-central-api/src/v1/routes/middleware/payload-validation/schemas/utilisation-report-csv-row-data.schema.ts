import z from 'zod';

const UtilisationReportCsvCellDataSchema = z.object({
  value: z.string().nullable(),
  column: z.string(),
  row: z.union([z.string(), z.number()]),
});

/**
 * Zod schema to validate if the passed in object is a valid utilisation report csv row data
 * (a record where the keys are strings and the properties are cell data objects)
 * For more information on zod see {@link https://zod.dev/}.
 */
export const UtilisationReportCsvRowDataSchema = z.record(z.string(), UtilisationReportCsvCellDataSchema);
