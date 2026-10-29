import zod from 'zod';

const UtilisationReportCsvCellDataSchema = zod.object({
  value: zod.string().nullable(),
  column: zod.string(),
  row: zod.union([zod.string(), zod.number()]),
});

/**
 * Zod schema to validate if the passed in object is a valid utilisation report csv row data
 * (a record where the keys are strings and the properties are cell data objects)
 * For more information on zod see {@link https://zod.dev/}.
 */
export const UtilisationReportCsvRowDataSchema = zod.record(zod.string(), UtilisationReportCsvCellDataSchema);
