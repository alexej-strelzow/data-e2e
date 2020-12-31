import HTMLElement from 'node-html-parser/dist/nodes/html';
import { createTestId } from '../utils/parser-utils';
import { ParseResult } from '../models/parse-result';
import { handleElements } from './generic-parser';

/**
 * @see {@link handleElements}
 */
export const handleInputElements = (inputElements: HTMLElement[], componentName: string): ParseResult[] => {
  const getWhatItIs = (input: HTMLElement): string =>
    input.getAttribute('id') ||
    input.getAttribute('formControlName') ||
    input.getAttribute('formControl') ||
    input.getAttribute('placeholder') ||
    '';
  const getTestId = (input: HTMLElement): string => createTestId({ componentName, whatItIs: getWhatItIs(input), typeSuffix: 'input' });

  return handleElements(inputElements, componentName, getTestId);
};
