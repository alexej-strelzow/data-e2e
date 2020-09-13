import {getHtmlFiles, writeFile} from "./file-utils";
import {parseHtml} from "./parser/html-parser";

function main() {
    const prompt = require('prompt');
    const onErr = (err: any) => {
        console.log(err);
        return 1;
    };

    const schema = {
        properties: {
            directory: {
                description: 'Please enter the path of the directory to be scanned',
                type: 'string',
                message: 'Directory must be a valid string!',
                required: true
            },
            filter: {
                description: 'Optional: Use a filter to modify only certain files',
                type: 'string',
                message: 'Filter must be a valid string!',
                required: false
            },
            dryRun: {
                description: 'Optional: Do a dry run (log to console instead of write to file) [true, false]',
                type: 'boolean',
                message: 'Answer must be either true or false',
                default: true,
                required: false
            }
        }
    };

    prompt.start();

    prompt.get(schema, (err: any, result: any) => {
        if (err) { return onErr(err); }

        const htmlFiles = getHtmlFiles(result.directory, result.filter);
        console.log(htmlFiles);

        htmlFiles.forEach((fileName: string) => {
            const newContent = parseHtml(fileName);
            writeFile(fileName, newContent, result.dryRun);
        });
    });
}

// for demo purpose enter "mock" when prompted
main();