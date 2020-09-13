import {readdirSync, statSync, writeFileSync} from "fs";

export const getHtmlFiles = (dir: string, filter: string | undefined) => {
    let results: string[] = [];
    const list = readdirSync(dir);

    list.forEach((file: string) => {
        file = dir + '/' + file;
        const stat = statSync(file);

        if (stat && stat.isDirectory()) { // recurse into a sub-directory
            results = results.concat(getHtmlFiles(file, filter));

        } else { // is a file
            const fileType = file.split('.').pop();

            if (fileType === 'html') {
                if (filter && file.match(new RegExp(filter, 'g'))) {
                    results.push(file);
                } else {
                    results.push(file);
                }
            }
        }
    });
    return results;
};

export const toKebabCase = (str: string) => {
    const STRING_DASHERIZE_REGEXP = (/[ _]/g);
    const STRING_DECAMELIZE_REGEXP = (/([a-z\d])([A-Z])/g);

    return str
        .replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase()
        .replace(STRING_DASHERIZE_REGEXP, '-');
};

export const writeFile = (fileName: string, content: string, dryRun: boolean) => {
    if (dryRun) {
        console.log(`New content for ${fileName}:`);
        console.log(content);
    } else {
        writeFileSync(fileName, content);
    }
};