import { randomBytes } from 'crypto';
import { TEST_ID } from '../../constants';
import { ParseResult } from '../models/parse-result';
import { TestId } from '../models/test-id';

const computeCommentRanges = (src: string): [{ begin: number; end: number }] => {
  const COMMENT_REGEX = /(?=<!--)([\s\S]*?)-->/gm;
  const commentZone: number[] = [];
  const commentRanges: [{ begin: number; end: number }] = [] as any;

  for (const match of src.matchAll(COMMENT_REGEX)) {
    const index: number = match.index || 0;
    const length: number = match[0].length;

    commentZone.push(index);
    commentZone.push(index + length);
  }

  while (commentZone.length !== 0) {
    const begin = commentZone.shift() || 0;
    const end = commentZone.shift() || 0;
    commentRanges.push({ begin, end });
  }

  return commentRanges;
};

const hasTestId = (idx: number, src: string) => {
  const endIndexCandidate1 = src.indexOf('/>', idx);
  const endIndexCandidate2 = src.indexOf('>', idx);
  const endIndex =
    endIndexCandidate1 === -1 && endIndexCandidate2 !== -1
      ? endIndexCandidate2
      : endIndexCandidate1 !== -1 && endIndexCandidate2 === -1
      ? endIndexCandidate1
      : endIndexCandidate1 < endIndexCandidate2
      ? endIndexCandidate1
      : endIndexCandidate2;

  return src.substring(idx, endIndex).includes(TEST_ID.attributeName);
};

const getRealStartIdx = (element: string, src: string, startIdx: number, commentRanges: [{ begin: number; end: number }]): number => {
  let ownsTestId = false;

  const isInCommentRange = (idx: number) => commentRanges.some(({ begin, end }) => idx >= begin && idx <= end);
  const getCommentRange = (idx: number) => commentRanges.find(({ begin, end }) => idx >= begin && idx <= end);

  do {
    while (isInCommentRange(startIdx)) {
      startIdx = src.indexOf(`<${element}`, getCommentRange(startIdx)?.end);
    }

    ownsTestId = hasTestId(startIdx, src);

    if (ownsTestId) {
      startIdx = src.indexOf(`<${element}`, startIdx + `<${element}`.length);
    }
  } while (ownsTestId);

  return startIdx;
};

/**
 * Adds new test-ids to a working copy of the original source code in provided order (results param).
 * The algorithm must not add the test-id when (see {@link getRealStartIdx}):
 * 1. The element is commented out (since node-html-parser ignores this as well by default)
 * 2. The element already has one (these test-ids are not part of the provided results array)
 *
 * @param element The html element (e.g. button)
 * @param results The test-ids to add
 * @param originalSource The original source file
 */
export const addTestIds = (element: string, results: ParseResult[], originalSource: string): string => {
  if (results.length === 0) {
    return originalSource;
  }

  let newSrc = originalSource;
  let startIdx = 0;

  const commentRanges: [{ begin: number; end: number }] = computeCommentRanges(originalSource);

  for (const { testId } of results) {
    // 0. determine position of element for test-id at hand
    startIdx = newSrc.indexOf(`<${element}`, startIdx);
    startIdx = getRealStartIdx(element, newSrc, startIdx, commentRanges);

    // 1. slice src where test-id needs to be inserted -> ${beginPart} ${endPart}
    // beginPart if element is input: '... <input'
    const beginPart = newSrc.substr(0, startIdx + `<${element}`.length);
    const endPart = newSrc.substr(beginPart.length);

    // 2. insert test-id -> ${beginPart} ${testId} ${endPart}
    newSrc = TEST_ID.empty ? `${beginPart} ${testId} ${endPart}` : `${beginPart} ${TEST_ID.attributeName}="${testId}" ${endPart}`;

    // 3. move startIdx so the same element won't be handled
    startIdx = beginPart.length;
  }

  return newSrc;
};

/**
 * Remove non non-alphanumeric characters but preserve hyphen
 *
 * @param input Text input
 */
export const removeInvalidCharacters = (input: string): string => input.replace(/[^0-9a-z-]/gi, '');

/**
 * Converts the given string to kebab-case, e.g. SomeInput -> some-input
 *
 * @param str The string to transform
 */
export const toKebabCase = (str: string): string => {
  const STRING_DASHERIZE_REGEXP = /[ _]/g;
  const STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;

  return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase().replace(STRING_DASHERIZE_REGEXP, '-');
};

/**
 * For empty text return hex string of length 16, e.g. 'ceda6613b8912628'.
 * Otherwise remove non-alphanumeric characters but preserve hyphen and kebap-case it afterwards.
 *
 * @param text Some string or empty string
 */
export const getWhatItIs = (text: string): string =>
  text ? toKebabCase(removeInvalidCharacters(text.trim())) : randomBytes(8).toString('hex');

/**
 * Create a test-id based on the given input.
 * The provided raw "what-it-is" part gets further processed to comply with the HTML 5 standard for custom attributes.
 *
 * @param testId The raw ingredients for a test-id
 */
export const createTestId = (testId: TestId): string => TEST_ID.toString({ ...testId, whatItIs: getWhatItIs(testId.whatItIs || '') });
