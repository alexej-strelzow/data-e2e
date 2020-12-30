import { getHtmlFiles, writeFile } from './file-utils';
import { processHtml } from './parser/html-parser';
import { StatisticsService } from './parser/statistics';

function runInteractiveMode() {
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
  console.log('Supported HTML Elements: anchor, button, input and mat-select');
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

    htmlFiles.forEach((fileName: string) => {
      const newContent = processHtml(fileName);
      writeFile(fileName, newContent, result.dryRun);
    });

    StatisticsService.getInstance().printStatistic();
  });
}

const { ci, dir } = require('minimist')(process.argv.slice(2));
// npm run ci -- --dir ../platox-ui/src/
if (ci) {
  const chalk = require('chalk');

  if (!dir) {
    console.error(chalk.red('Directory is missing (e.g. npm run ci -- --dir ../platox-ui/src/)! Exiting with ERROR!'));
    process.exit(1);
  }

  const htmlFiles = getHtmlFiles(dir);

  if (htmlFiles.length === 0) {
    console.log(chalk.yellow('No html files in directory: ', dir));
    process.exit(0);
  }

  console.log('Processing files: ', htmlFiles);
  htmlFiles.forEach(processHtml);

  const statistics = StatisticsService.getInstance();
  const summary = statistics.getSummary();

  if (summary.newIds > 0 || summary.collisions > 0) {
    console.error(chalk.red('New IDs or collisions detected! Exiting with ERROR!'));
    console.log(chalk.red(JSON.stringify(summary, null, 2)));
    process.exit(1);
  } else if (statistics.getDuplicateExistingSelectors().length > 0) {
    console.error(chalk.red('Duplicated existing selectors found! Exiting with ERROR!'));
    console.log(chalk.red(JSON.stringify(statistics.getDuplicateExistingSelectors(), null, 2)));
    process.exit(1);
  } else if (statistics.getDuplicateSelectors().length > 0) {
    console.error(chalk.red('Duplicated selectors (old + new combined) found! Exiting with ERROR!'));
    console.log(chalk.red(JSON.stringify(statistics.getDuplicateSelectors(), null, 2)));
    process.exit(1);
  }
} else {
  // for demo purpose enter "mock" when prompted
  runInteractiveMode();
}
