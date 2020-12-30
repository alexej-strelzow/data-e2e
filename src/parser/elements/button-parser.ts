import HTMLElement from 'node-html-parser/dist/nodes/html';
import { createTestId } from '../parser-utils';
import { ParseResult } from '../models/parse-result';
import { handleElements } from './generic-parser';

/**
 * @see {@link handleElements}
 */
export const handleButtonElements = (buttonElements: HTMLElement[], componentName: string): ParseResult[] => {
  const getTestId = (button: HTMLElement): string => createTestId({ componentName, whatItIs: button.text, typeSuffix: 'button' });

  return handleElements(buttonElements, componentName, getTestId);
};
