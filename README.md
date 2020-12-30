# Data E2E Handler

Run `npm start` to run this project.
You will be asked 2 questions:
1. Please enter the path of the directory to be scanned
   > for demo purposes enter `mock`
2. Optional: Do a dry run (log to console instead of write to file) [true, false]
   > you can skip that and see the result in the console

You will be prompted to enter the directory to scan. This path is relative form this project's root.
E.g. the root is `/data-e2e`, if you enter `mock`, then `/data-e2e/mock` gets scanned.

## Configuration

See `constants.ts`:
- Prefix or Attribute Name: `process.env.DATA_E2E || 'data-e2e'`
- Empty Attribute?: `process.env.DATA_E2E_EMPTY !== 'false'`
- Suffix in case of Collision: `process.env.COLLISION_SUFFIX || 'TODO-COLLISION'`

The test-id String can contain the following information `<component-name>-<what-it-is>-<type>` (e.g. `add-files-save-button`).
- `component-name`: the name of the file
- `what-it-is`: describes the element
- `type`: the element type, e.g. `button` or `input`

It can either be part of the `data-e2e`-attribute (can be configured) or an empty attribute (see section below).

Ultimately you can decide how to render it via the `toString`-method (also `constants.ts`):
```typescript
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
```

## Workflow

To detect the html elements `node-html-parser` is used. Once an element got detected the test-id gets inferred if not present yet.
Unfortunately this lib cannot be used to insert the test-id and write the file back as it will discard non-html attributes (e.g. Angular directives).
Inserting the test-id and writing it back happens via built-in API (see `parser-utils#addTestIds`).

### Empty Attribute (DATA_E2E_EMPTY)
The attribute has no value, e.g. `data-e2e-save-button`.

1. Determine the path of all html files in the scan-dir (comes from user input - 1. question) and its sub-dirs
2. for each html file, run a set of parsers (1 parser per html-type, e.g. button-parser, input-parser)
3. each parser infers the value of the `data-e2e` custom attribute (`data-e2e-<component-name>-<what-it-is>-<type>`)
4. if `what-it-is` cannot be inferred a UUID is used instead
5. if the whole selector/value is ambiguous (not unique): add a `TODO-COLLISION`-suffix to the selector
6. write the modified html content back to the original file (if not using `dryRun` - 2. question) 

### Non-Empty Attribute (DATA_E2E_EMPTY)
The attribute has a value, e.g. `data-e2e="save-button"`.

1. Determine the path of all html files in the scan-dir (comes from user input - 1. question) and its sub-dirs
2. for each html file, run a set of parsers (1 parser per html-type, e.g. button-parser, input-parser)
3. each parser infers the value of the `data-e2e` custom attribute (`data-e2e="<component-name>-<what-it-is>-<type>"`)
4. if `what-it-is` cannot be inferred a UUID is used instead
5. if the whole selector/value is ambiguous (not unique): add a `TODO-COLLISION`-suffix to the selector
6. write the modified html content back to the original file (if not using `dryRun` - 2. question) 
