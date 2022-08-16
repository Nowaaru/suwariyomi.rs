/**
 * @jest-environment jsdom
 */

import "jest";
import { createRoot } from "react-dom/client";
import {
    css,
    StyleSheet,
    Animation,
    rgba,
    rgb,
} from "../../src/util/aphrodite";
import { getComputedStyle } from "./utilities/tsx";

describe("Aphrodite", () => {
    const root = createRoot(
        document.body.appendChild(document.createElement("div"))
    );
    describe("StyleSheets", () => {
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
                root.render(<div className={css(styles.jerry)} />);

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

    describe("Keyframes", () => {
        const keyframeAnimation = new Animation({
            ["35%"]: {
                transform: "scale(1) rotate(0deg)",
                filter: "blur(0)",
            },
            ["40%"]: {
                transform: "scale(0.8) rotate(0deg)",
            },
            ["40.01%"]: {
                transform: "scale(0.8) rotate(0deg)",
                filter: "blur(4px)",
            },
            ["95%"]: {
                transform: "scale(0.8) rotate(calc(360deg * 8))",
                filter: "blur(4px)",
            },
            ["95.01%"]: {
                filter: "blur(0)",
                transform: "scale(0.8) rotate(0deg)",
            },
        });

        it("should work", () => {
            expect(keyframeAnimation).toBeDefined();
            expect(keyframeAnimation.json()).toHaveProperty("95%");
        });
    });

    describe("Auxiliary Functions", () => {
        describe("rgba", () => {
            it("should work", () => {
                expect(rgba(255, 255, 255, 0.8)).toBe(
                    "rgba(255, 255, 255, 0.8)"
                );
            });
        });

        describe("rgb", () => {
            it("should work", () => {
                expect(rgb(255, 255, 255)).toBe("rgb(255, 255, 255)");
            });
        });
    });
});
