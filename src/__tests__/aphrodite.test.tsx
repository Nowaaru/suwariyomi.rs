/**
 * @jest-environment jsdom
 */

import "jest";
import * as ReactDOM from "react-dom";
import { css, StyleSheet } from "aphrodite";
import { getComputedStyle } from "./utilities/tsx";

describe("Aphrodite", () => {
    const styles = StyleSheet.create({
        jerry: {
            backgroundColor: "red" /* this one's pretty mad! */,
            resize: "none",
            width: "100px",
            height: "100px",
        },
        george: {
            resize: "none",
            width: "100px",
            height: "50px" /* he's a pretty chunky guy! */,
        },
    });

    it("should work", () => {
        expect(styles).toBeDefined();
        expect(styles.jerry).toBeDefined();
        expect(styles.george).toBeDefined();
    });

    it("should be compatible with its sibling function, css.", () => {
        expect(css(styles.jerry)).toBeDefined();
        expect(css(styles.george)).toBeDefined();
    });

    describe("effectiveness in-dom", () => {
        it("should be able to apply to a DOM element", () => {
            ReactDOM.render(
                <div id="item" className={css(styles.jerry)} />,
                document.body.appendChild(document.createElement("div"))
            );

            const dom_conversion = document.getElementById("item");
            expect(dom_conversion).toBeDefined();

            // these two have to be separate because there was an error that
            // appleid the css styling to the element, but the declarations
            // were not applied to the element.
            expect(dom_conversion?.className).not.toBe("");
            if (dom_conversion) {
                expect(
                    getComputedStyle(
                        dom_conversion as HTMLElement
                    ).getPropertyValue("background-color")
                ).toBe("red");
            }
        });
    });
});
