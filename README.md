# Data E2E Handler

Run `npm start` to run this project.
You will be asked 3 questions:
1. Please enter the path of the directory to be scanned
   > for demo purposes enter `mock`
2. Optional: Use a filter to modify only certain files
   > you can skip that with enter if you don't want any filter (regex)
3. Optional: Do a dry run (log to console instead of write to file) [true, false]
   > you can skip that and see the result in the console

You will be prompted to enter the directory to scan. This path is relative form this project's root.
E.g. the root is `/data-e2e`, if you enter `mock`, then `/data-e2e/mock` gets scanned.

## Workflow

1. Determine the path of all html files in the scan-dir (comes from user input - 1. question) and its sub-dirs
2. for each html file, run a set of parsers (1 parser per html-type, e.g. button-parser, input-parser)
3. each parser infers the value of the `data-e2e` custom attribute (`data-e2e="<component-name>-<what-it-is>-<type>`)
4. if `what-it-is` cannot be inferred a UUID is used instead
5. if the whole selector/value is ambiguous (not unique): add a `TODO-COLLISION`-suffix to the selector
6. write the modified html content back to the original file (if not using `dryRun` - 3. question) 