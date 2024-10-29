import { AnyObject } from '@ukef/dtfs2-common';
import { exporterStatus } from '../controllers/validation/exporter';

export const cloneExporter = (currentExporter: AnyObject) => {
  const clonedExporter = currentExporter;

  // update the `updatedAt` property and set it to null - default value
  clonedExporter.updatedAt = Date.now();
  clonedExporter.status = exporterStatus(clonedExporter);

  return clonedExporter;
};
