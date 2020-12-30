import { randomBytes } from 'crypto';
import { TEST_ID } from '../constants';
import { ParseResult } from './models/parse-result';
import { TestId } from './models/test-id';

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

export const addTestIds = (element: string, results: ParseResult[], originalSource: string): string => {
  if (results.length === 0) {
    return originalSource;
  }

  let newSrc = originalSource;
  let startIdx = 0;
  let beginPart: string;
  let endPart: string;

  const commentRanges: [{ begin: number; end: number }] = computeCommentRanges(originalSource);
  const isInCommentRange = (idx: number) => commentRanges.some(({ begin, end }) => idx >= begin && idx <= end);
  const getCommentRange = (idx: number) => commentRanges.find(({ begin, end }) => idx >= begin && idx <= end);

  for (const { selector } of results) {
    startIdx = newSrc.indexOf(`<${element}`, startIdx);

    while (isInCommentRange(startIdx)) {
      startIdx = newSrc.indexOf(`<${element}`, getCommentRange(startIdx)?.end);
    }

    beginPart = newSrc.substr(0, startIdx + `<${element}`.length);
    endPart = newSrc.substr(beginPart.length);

    newSrc = TEST_ID.empty ? `${beginPart} ${selector} ${endPart}` : `${beginPart} ${TEST_ID.attributeName}="${selector}" ${endPart}`;

    startIdx = beginPart.length;
  }

  return newSrc;
};

export const createTestId = (testId: Partial<TestId>) => {
  return TEST_ID.toString({ ...testId, whatItIs: getWhatItIs(testId.whatItIs || '') });
};

/**
 * For empty text return hex string of length 16, e.g. 'ceda6613b8912628'.
 * Otherwise remove non-alphanumeric characters but preserve hyphen and kebap-case it afterwards.
 * @param text Some string or empty string
 */
export const getWhatItIs = (text: string) => (text ? toKebabCase(removeInvalidCharacters(text.trim())) : randomBytes(8).toString('hex'));

/**
 * Remove non non-alphanumeric characters but preserve hyphen
 * @param input Text input
 */
export const removeInvalidCharacters = (input: string) => input.replace(/[^0-9a-z\-]/gi, '');

export const toKebabCase = (str: string): string => {
  const STRING_DASHERIZE_REGEXP = /[ _]/g;
  const STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;

  return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase().replace(STRING_DASHERIZE_REGEXP, '-');
};
