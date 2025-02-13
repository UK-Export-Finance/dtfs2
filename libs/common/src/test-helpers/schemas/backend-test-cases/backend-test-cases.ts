import { TestCaseWithType } from '../types/test-case-with-type.type';

export type BackendTestCase =
  | TestCaseWithType<'OBJECT_ID_SCHEMA'>
  | TestCaseWithType<'OBJECT_ID_STRING_SCHEMA'>
  | TestCaseWithType<'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA'>
  | TestCaseWithType<'AUDIT_DATABASE_RECORD_SCHEMA'>
  | TestCaseWithType<'TFM_SESSION_USER_SCHEMA'>;
