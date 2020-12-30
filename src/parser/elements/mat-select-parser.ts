import HTMLElement from 'node-html-parser/dist/nodes/html';
import { createTestId } from '../parser-utils';
import { ParseResult } from '../models/parse-result';
import { handleElements } from './generic-parser';

/**
 * @see {@link handleElements}
 */
export const handleMatSelectElements = (selectElements: HTMLElement[], componentName: string): ParseResult[] => {
  const getWhatItIs = (matSelect: HTMLElement): string | undefined =>
    matSelect.getAttribute('id') ||
    matSelect.getAttribute('formControlName') ||
    matSelect.getAttribute('formControl') ||
    matSelect.getAttribute('placeholder');
  const getTestId = (matSelect: HTMLElement): string =>
    createTestId({ componentName, whatItIs: getWhatItIs(matSelect), typeSuffix: 'select' });

  return handleElements(selectElements, componentName, getTestId);
};
