/**
 * @jest-environment jsdom
 */

import "jest";
import * as ReactDOM from "react-dom";
import { css, StyleSheet } from "../util/aphrodite";

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
                <div id="item" className={css(styles.jerry, styles.george)} />,
                document.body.appendChild(document.createElement("div"))
            );

            const dom_conversion = document.getElementById("item");
            expect(dom_conversion).toBeDefined();

            expect(dom_conversion?.className).not.toBe("");
        });
    });
});
