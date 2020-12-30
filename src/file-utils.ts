import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';

/**
 * Return all filenames of a given directory and its sub-dirs (w.r.t the optional filter)
 *
 * @param dir The directory
 * @param filter The optional filter
 */
export const getHtmlFiles = (dir: string, filter?: string): string[] => {
  let results: string[] = [];
  const list = readdirSync(dir);

  list.forEach((file: string) => {
    file = dir + '/' + file;
    const stat = statSync(file);

    if (stat && stat.isDirectory()) {
      // recurse into a sub-directory
      results = results.concat(getHtmlFiles(file, filter));
    } else {
      // is a file
      const fileType = file.split('.').pop();

      if (fileType === 'html') {
        if (filter) {
          if (new RegExp(filter, 'g').exec(file) !== null) {
            results.push(file);
          }
        } else {
          results.push(file);
        }
      }
    }
  });
  return results;
};

/**
 * Write file to fs or print to console depending on `dryRun`
 *
 * @param fileName The name of the file
 * @param content The new content
 * @param dryRun `true` print content to console, otherwise write to fs
 */
export const writeFile = (fileName: string, content: string, dryRun: boolean): void => {
  if (dryRun) {
    console.log(`New content for ${fileName}:`);
    console.log(content);
  } else {
    writeFileSync(fileName, content);
  }
};

/**
 * Read file sync and return content utf-8 encoded
 *
 * @param fileName The file to read
 */
export const readFile = (fileName: string): string => readFileSync(fileName, 'utf-8');
