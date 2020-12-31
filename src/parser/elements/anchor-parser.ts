import HTMLElement from 'node-html-parser/dist/nodes/html';
import { createTestId } from '../utils/parser-utils';
import { ParseResult } from '../models/parse-result';
import { handleElements } from './generic-parser';

/**
 * @see {@link handleElements}
 */
export const handleAnchorElements = (anchorElements: HTMLElement[], componentName: string): ParseResult[] => {
  const getTestId = (anchor: HTMLElement): string => createTestId({ componentName, whatItIs: anchor.text, typeSuffix: 'anchor' });

  return handleElements(anchorElements, componentName, getTestId);
};
