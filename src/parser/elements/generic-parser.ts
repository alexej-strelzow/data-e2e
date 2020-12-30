import HTMLElement from 'node-html-parser/dist/nodes/html';
import { TEST_ID } from '../../constants';
import { ParseResult } from '../models/parse-result';

/**
 * Creates a test-id for the HTML element at hand.
 * If the test-id is an empty attribute ({@link DATA_E2E_EMPTY}),
 * Then:       data-e2e-<component-name>-<what-it-is>-<type>
 * Otherwise:  data-e2e="<component-name>-<what-it-is>-<type>".
 *
 *
 * In case the <what-it-is> part cannot be inferred, we use a generated UUID instead.
 * In case of collision a suffix is added to the attribute value above.
 *
 * Note:
 * The {@link TEST_ID#toString} function decides which parts get used as test-id and which not.
 *
 * @param elements All found elements
 * @param componentName The name of the Angular component (taken from the file name)
 * @param getTestId Function that returns the test-id for the HTML element at hand
 */
export const handleElements = (
  elements: HTMLElement[],
  componentName: string,
  getTestId: (element: HTMLElement) => string
): ParseResult[] => {
  const result: ParseResult[] = [];
  const e2eAttrMap: Map<string, boolean> = new Map();
  let selector;
  let existing = false;

  const getTestIdAttribute = (element: HTMLElement) => {
    return TEST_ID.empty
      ? Object.keys(element.attributes).find((key: string) => key.startsWith(TEST_ID.attributeName))
      : element.getAttribute(TEST_ID.attributeName);
  };

  (elements || []).map((element: HTMLElement, index: number) => {
    const attr = getTestIdAttribute(element);

    if (!attr) {
      selector = getTestId(element);

      if (e2eAttrMap.has(selector)) {
        selector = `${selector}-${TEST_ID.collisionSuffix}`;
      }

      e2eAttrMap.set(selector, true);
    } else {
      existing = true;
      selector = attr;
      e2eAttrMap.set(attr, true);
    }

    result.push({ existing, selector, collision: selector.endsWith(`-${TEST_ID.collisionSuffix}`) });
  });

  return result;
};
