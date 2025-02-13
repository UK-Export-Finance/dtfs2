import { BackendTestCase } from '../backend-test-cases/backend-test-cases';
import { TestCase } from './test-case';

export type BaseTestCase = TestCase | BackendTestCase;
