import { TestId } from './parser/models/test-id';

/**
 * Name of the custom attribute
 */
const DATA_E2E = process.env.DATA_E2E || 'data-e2e';

/**
 * Is the attribute empty? data-e2e-<selector> vs data-e2e="<selector>"
 */
const DATA_E2E_EMPTY = process.env.DATA_E2E_EMPTY !== 'false';

/**
 * Marker for a test-id that the same (w.o. suffix) already exists in the document
 */
const COLLISION_SUFFIX = process.env.COLLISION_SUFFIX || 'TODO-COLLISION';

export const TEST_ID = {
  attributeName: DATA_E2E,
  empty: DATA_E2E_EMPTY,
  collisionSuffix: COLLISION_SUFFIX,
  /**
   * String-Representation of the test id which ends up in the HTML file.
   * @param testId All possible parts a test-id can have
   */
  toString: (testId: Partial<TestId>): string => {
    const { whatItIs, typeSuffix } = testId;

    return DATA_E2E_EMPTY ? `${DATA_E2E}-${whatItIs}-${typeSuffix}` : `${whatItIs}-${typeSuffix}`;
  }
};
