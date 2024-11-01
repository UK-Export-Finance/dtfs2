import { AnyObject } from '@ukef/dtfs2-common';
import { exporterStatus } from '../../../controllers/validation/exporter';

/**
 * Clones the exporter
 * @param currentExporter the current exporter
 * @returns the exporter with updatedAt set to now
 */
export const generateClonedExporter = (currentExporter: AnyObject) => {
  const clonedExporter = currentExporter;

  clonedExporter.updatedAt = Date.now();
  clonedExporter.status = exporterStatus(clonedExporter);

  return clonedExporter;
};
