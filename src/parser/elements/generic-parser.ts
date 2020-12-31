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
 * @param createTestId Function that returns the test-id for the HTML element at hand
 */
export const handleElements = (
  elements: HTMLElement[],
  componentName: string,
  createTestId: (element: HTMLElement) => string
): ParseResult[] => {
  const result: ParseResult[] = [];
  const e2eAttrMap: Map<string, boolean> = new Map();
  let testId: string;
  let existing: boolean;
  let collision: boolean;

  const getTestIdAttribute = (element: HTMLElement) =>
    TEST_ID.empty
      ? Object.keys(element.attributes).find((key: string) => key.startsWith(TEST_ID.attributeName))
      : element.getAttribute(TEST_ID.attributeName);

  (elements || []).map((element: HTMLElement) => {
    const attr = getTestIdAttribute(element);

    if (!attr) {
      existing = false;
      testId = createTestId(element);

      if (e2eAttrMap.has(testId)) {
        testId = `${testId}-${TEST_ID.collisionSuffix}`;
        collision = true;
      }
    } else {
      existing = true;
      testId = attr;
      collision = false;
    }

    e2eAttrMap.set(testId, true);
    result.push({ existing, testId, collision });
  });

  return result;
};
