import {parse} from "node-html-parser";
import {readFileSync} from "fs";
import {handleInputElements} from "./input-parser";
import {handleButtonElements} from "./button-parser";

export const parseHtml = (fileName: string): string => {
    const componentName = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.indexOf('.component'));

    const root = parse(readFileSync(fileName, 'utf-8'));

    handleInputElements(root.querySelectorAll('input'), componentName);
    handleButtonElements(root.querySelectorAll('button'), componentName);
    // TODO: add more

    return root.toString();
};
