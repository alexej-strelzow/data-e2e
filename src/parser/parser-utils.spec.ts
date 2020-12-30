import { getWhatItIs, removeInvalidCharacters, toKebabCase } from './parser-utils';
import { TestId } from './models/test-id';

describe('parser-utils', () => {
  describe('atoms', () => {
    it('should transform to kebab case', () => {
      expect(toKebabCase('Upload Samples')).toEqual('upload-samples');
    });

    it('should remove non-alphanumeric characters', () => {
      expect(removeInvalidCharacters('Upload & Review')).toEqual('UploadReview');
    });

    it('should preserve hyphen', () => {
      expect(removeInvalidCharacters('Upload - Review')).toEqual('Upload-Review');
    });
  });

  describe('getWhatItIs', () => {
    it('should get what it is correctly from text input', () => {
      expect(getWhatItIs('Upload Samples')).toEqual('upload-samples');
      expect(getWhatItIs('Upload & Review')).toEqual('upload-review');
    });

    it('should generate hex-id from empty input', () => {
      expect(getWhatItIs('').length).toEqual(16);
    });
  });

  describe('createTestId', () => {
    beforeEach(() => {
      jest.resetModules();
      process.env = {};
    });

    it('should create the correct test id when test id is an empty attribute', () => {
      const { TEST_ID } = require('../constants');
      const { createTestId } = require('./parser-utils');
      const testId: TestId = { componentName: 'app', whatItIs: 'Add Sample', typeSuffix: 'button' };

      expect(createTestId(testId)).toEqual(`${TEST_ID.attributeName}-add-sample-button`);
    });

    it('should create the correct test id when test id is NOT an empty attribute', () => {
      process.env.DATA_E2E_EMPTY = 'false';

      const { createTestId } = require('./parser-utils');
      const testId: TestId = { componentName: 'app', whatItIs: 'Add Sample', typeSuffix: 'button' };

      expect(createTestId(testId)).toEqual(`add-sample-button`);
    });

    it('should not remove the hyphen', () => {
      const { TEST_ID } = require('../constants');
      const { createTestId } = require('./parser-utils');
      const testId: TestId = { componentName: 'app', whatItIs: 'with-hyphen', typeSuffix: 'button' };

      expect(createTestId(testId)).toEqual(`${TEST_ID.attributeName}-with-hyphen-button`);
    });
  });
});
