import {parse} from "node-html-parser";
import {readFileSync} from "fs";
import {handleInputElements} from "./input-parser";
import {handleButtonElements} from "./button-parser";
import {DATA_E2E} from "../constants";

export const parseHtml = (fileName: string): string => {
    const componentName = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.indexOf('.component'));

    const src = readFileSync(fileName, 'utf-8');
    const root = parse(src);

    let copy = src;

    copy = addIds('input', handleInputElements(root.querySelectorAll('input'), componentName), copy);
    copy = addIds('button', handleButtonElements(root.querySelectorAll('button'), componentName), copy);
    // TODO: add more

    return copy;
};

const addIds = (element: string, ids: Map<number, string>, originalSource: string): string => {

    let newSrc = originalSource;
    let startIdx = 0;
    let beginPart;
    let endPart;

    const commentRanges: [{begin: number, end: number}] = computeCommentRanges(originalSource);
    const isInCommentRange = (idx: number) => commentRanges.some(({begin, end}) => idx >= begin && idx <= end);
    const getCommentRange = (idx: number) => commentRanges.find(({begin, end}) => idx >= begin && idx <= end);

    for (const selector of ids.values()) {
        startIdx = newSrc.indexOf(`<${element}`, startIdx);

        while(isInCommentRange(startIdx)) {
            startIdx = newSrc.indexOf(`<${element}`, getCommentRange(startIdx)?.end);
        }

        beginPart = newSrc.substr(0, startIdx + `<${element}`.length);
        endPart = newSrc.substr(beginPart.length);

        newSrc = `${beginPart} ${DATA_E2E}="${selector}" ${endPart}`;

        startIdx = beginPart.length;
    }

    return newSrc;
};

const computeCommentRanges = (src: string): [{begin: number, end: number}] => {
    const COMMENT_REGEX = /(?=<!--)([\s\S]*?)-->/gm;
    const commentZone: number[] = [];
    const commentRanges: [{begin: number, end: number}] = [] as any;

    for (const match of src.matchAll(COMMENT_REGEX)) {
        commentZone.push(match.index || 0);
        commentZone.push((match.index || 0) + match[0].length);
    }

    while (commentZone.length !== 0) {
        let begin = commentZone.shift() || 0;
        let end = commentZone.shift() || 0;
        commentRanges.push({begin, end});
    }

    return commentRanges;
};
