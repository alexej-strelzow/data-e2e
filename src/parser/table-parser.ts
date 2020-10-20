import HTMLElement from "node-html-parser/dist/nodes/html";
import {toKebabCase} from "../file-utils";
import {randomBytes} from "crypto";
import {COLLISION_SUFFIX, DATA_E2E} from "../constants";

/**
 * Adds the following custom attribute: data-e2e="<component-name>-<what-it-is>-<type>".
 *
 * In case the <what-it-is> part cannot be inferred, we use a generated UUID instead.
 * In case of collision a suffix is added to the attribute value above.
 *
 * @param inputElements All found input elements
 * @param componentName The name of the Angular component (taken from the file name)
 */
export const handleTableElements = (inputElements: HTMLElement[], componentName: string) => {
    const e2eAttrMap: any = {};

    const getWhatItIs = (input: HTMLElement) => {
        return toKebabCase(
            input.getAttribute('placeholder') ||
            input.getAttribute('formControlName') ||
            randomBytes(16).toString("hex")
        );
    };

    (inputElements || []).forEach((input: HTMLElement) => {
        if (!input.hasAttribute(DATA_E2E)) {
            const whatItIs = getWhatItIs(input);
            let selector = `${componentName}-${whatItIs}-input`;

            if (!!e2eAttrMap[selector]) { // collision
                selector = `${selector}-${COLLISION_SUFFIX}`;
            }

            input.setAttribute(DATA_E2E, selector);
            e2eAttrMap[selector] = true;

            console.log(`[Input] add new selector: ${selector}`);
        } else {
            const attr: string = input.getAttribute(DATA_E2E) || ''; // TODO: || '' should not be necessary
            e2eAttrMap[attr] = true;
        }
    });
};
