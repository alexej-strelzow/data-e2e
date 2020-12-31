import { parse } from 'node-html-parser';
import HTMLElement from 'node-html-parser/dist/nodes/html';
import { StatisticsService } from './statistics';
import { readFile } from '../file-utils';
import { addTestIds } from './utils/parser-utils';
import { ParseResult } from './models/parse-result';
import { handleInputElements } from './elements/input-parser';
import { handleButtonElements } from './elements/button-parser';
import { handleAnchorElements } from './elements/anchor-parser';

// eslint-disable-next-line
enum Element {
  ANCHOR = 'a',
  BUTTON = 'button',
  INPUT = 'input'
}

const processInternally = (fileName: string, src: string, root: HTMLElement): string => {
  const componentName = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.indexOf('.component'));

  const executionArray = [
    { element: Element.ANCHOR, fn: () => handleAnchorElements(root.querySelectorAll(Element.ANCHOR), componentName) },
    { element: Element.BUTTON, fn: () => handleButtonElements(root.querySelectorAll(Element.BUTTON), componentName) },
    { element: Element.INPUT, fn: () => handleInputElements(root.querySelectorAll(Element.INPUT), componentName) }
    // add your element-parser here
  ];

  let workingCopy = src;

  executionArray.forEach((e: { element: string; fn: () => ParseResult[] }) => {
    const result: ParseResult[] = e.fn();
    const newSelectors = result.filter((p: ParseResult) => !p.existing);

    workingCopy = addTestIds(e.element, newSelectors, workingCopy);

    StatisticsService.getInstance().addStatistic(fileName, e.element, result);
  });

  return workingCopy;
};

/**
 * Reads the given file and parses the content via `node-html-parser`.
 * The result of the parsing step is an html-tree and we use the returned root node to query for elements,
 * we would like to check for `test-ids`.
 * If the elements of interest do not have such a test-id yet, we add it to the original source, as we are
 * loosing all Angular-specific attributes during the parsing step. Therefore we only use the parsed representation
 * of the html file to conveniently detect and if necessary compute `test-ids`.
 * And in a second step we add them to the respective elements in the original source code.
 *
 * @param fileName The html file to process
 */
export const processHtml = (fileName: string): string => {
  const src = readFile(fileName);
  const root: HTMLElement = parse(src);

  return processInternally(fileName, src, root);
};
