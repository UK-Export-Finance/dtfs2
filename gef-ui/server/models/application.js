import {
  getApplication,
  getCoverTerms,
  getExporter,
  getFacilities,
  getUserDetails,
} from '../services/api';
import { status } from '../utils/helpers';
import { PROGRESS } from '../../constants';

export default class Application {
  static async findById(id, user, userToken) {
    try {
      const application = await getApplication(id);
      if (application.bankId !== user.bank.id) {
        return null;
      }

      application.id = id;

      const exporterPro = getExporter(application.exporterId);
      const coverTermsPro = getCoverTerms(application.coverTermsId);
      const facilitiesPro = getFacilities(id);

      const all = await Promise.all([exporterPro, coverTermsPro, facilitiesPro]);
      [application.exporter, application.coverTerms, application.facilities] = [...all];

      application.exporterStatus = status[application.exporter.status || PROGRESS.NOT_STARTED];
      application.coverStatus = status[application.coverTerms.status || PROGRESS.NOT_STARTED];
      application.facilitiesStatus = status[application.facilities.status || PROGRESS.NOT_STARTED];

      // Can only submit when all section statuses are set to complete
      // and the application is in Draft or CHANGES_REQUIRED
      application.canSubmit = application.exporterStatus.code === PROGRESS.COMPLETED
        && application.coverStatus.code === PROGRESS.COMPLETED
        && application.facilitiesStatus.code === PROGRESS.COMPLETED
        && ['Draft', 'CHANGES_REQUIRED'].includes(application.status)
        && user.roles.includes('maker');

      application.checkerCanSubmit = ['BANK_CHECK'].includes(application.status)
        && user._id !== application.userId // The checker is not the maker
        && user.roles.includes('checker');

      if (!['Draft'].includes(application.status)) {
        application.maker = await getUserDetails(application.userId, userToken);
      }
      if (application.checkerId) {
        application.checker = await getUserDetails(application.checkerId, userToken);
      }
      return application;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      throw err;
    }
  }
}
