import { getHtmlFiles, writeFile } from './file-utils';
import { processHtml } from './parser/html-parser';
import { StatisticsService } from './parser/statistics';

function main() {
  const prompt = require('prompt');
  const onErr = (err: any) => {
    console.log(err);
    return 1;
  };

  console.log('###############################################################################');
  console.log(' ####################          TEST ID GENERATOR          #################### ');
  console.log('###############################################################################');
  console.log('');
  console.log('This tool scans through a source directory and adds missing data-e2e IDs to certain elements.');
  console.log('Supported HTML Elements: anchor, button and input');
  console.log('Please answer the following questions below:');
  console.log('');

  const schema = {
    properties: {
      directory: {
        description: 'Please enter the (relative or absolute) path of the directory to be scanned',
        type: 'string',
        message: 'Directory must be a valid string!',
        required: true
      },
      /*filter: {
        description: 'Optional: Use a filter to modify only certain files',
        type: 'string',
        message: 'Filter must be a valid string!',
        required: false
      },*/
      dryRun: {
        description: 'Optional: Do a dry run (log changes to console only) [true, false]',
        type: 'boolean',
        message: 'Answer must be either true or false',
        default: true,
        required: false
      }
    }
  };

  prompt.start();

  prompt.get(schema, (err: any, result: any) => {
    if (err) {
      return onErr(err);
    }

    const htmlFiles = getHtmlFiles(result.directory, result.filter);
    console.log(htmlFiles);

    htmlFiles.forEach((fileName: string) => {
      const newContent = processHtml(fileName);
      writeFile(fileName, newContent, result.dryRun);
    });

    StatisticsService.getInstance().printStatistic();
  });
}

// for demo purpose enter "mock" when prompted
main();
