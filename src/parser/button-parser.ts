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
 * @param buttonElements All found button elements
 * @param componentName The name of the Angular component (taken from the file name)
 */
export const handleButtonElements = (buttonElements: HTMLElement[], componentName: string) => {
    const e2eAttrMap: any = {};

    const getWhatItIs = (button: HTMLElement) => {
        return toKebabCase(
            button.text.trim() ||
            randomBytes(16).toString("hex")
        );
    };

    (buttonElements || []).forEach((button: HTMLElement) => {
        if (!button.hasAttribute(DATA_E2E)) {
            const whatItIs = getWhatItIs(button);
            let selector = `${componentName}-${whatItIs}-button`;

            if (!!e2eAttrMap[selector]) { // collision
                selector = `${selector}-${COLLISION_SUFFIX}`;
            }

            button.setAttribute(DATA_E2E, selector);
            e2eAttrMap[selector] = true;

            console.log(`[Button] add new selector: ${selector}`);
        } else {
            const attr: string = button.getAttribute(DATA_E2E) || ''; // TODO: || '' should not be necessary
            e2eAttrMap[attr] = true;
        }
    });
};