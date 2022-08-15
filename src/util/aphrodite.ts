import {
    css as emotion_css,
    keyframes as emotion_keyframes,
} from "@emotion/css";
import { CSSObject } from "@emotion/serialize";
type Styles<T = unknown> = {
    [K in keyof T]: CSSObject | Styles<T[K]>;
};
class Style {
    static toStyle(CSSObject: CSSObject): Style[] {
        return (Object.keys(CSSObject) as Array<keyof CSSObject>).reduce(
            (acc: Style[], key: keyof CSSObject) => {
                acc.push(new Style(key, CSSObject[key]));
                return acc;
            },
            []
        );
    }

    constructor(style: keyof CSSObject, value: CSSObject[keyof CSSObject]) {
        this._key = style;
        this._value = value;
    }

    public _key: keyof CSSObject;
    public _value: CSSObject[keyof CSSObject];
}

export class StyleSheet {
    static create<TYPE>(styles: Styles<TYPE>): {
        [KEY in keyof TYPE]: Style;
    } {
        const result: Record<string, Style> = {};
        (Object.keys(styles) as (keyof TYPE)[]).forEach((key: keyof TYPE) => {
            result[key as string] = new Style(
                key as string as keyof CSSObject,
                styles[key] as CSSObject[keyof CSSObject]
            );
        });

        return result as {
            [KEY in keyof TYPE]: Style;
        };
    }
}

export function css(...styles: (Style | false)[]) {
    const CSSValues: {
        [KEY in keyof CSSObject]: CSSObject[keyof CSSObject];
    } = {};

    styles.forEach((style: Style | false) => {
        if (style) {
            CSSValues[style._key] = style._value;
        }
    });

    return emotion_css(...Object.values(CSSValues as Record<string, string>));
}

interface AnimationOptions {
    iterations?: CSSObject["animationIterationCount"];
    duration?: string | number;
    easing?: CSSObject["animationTimingFunction"];
    delay?: string | number;
}

export class Animation {
    constructor(styleData: { [key: string]: CSSObject }) {
        const objectKeys = Object.keys(styleData);
        const validKeys = [/from/, /to/, /\d+(?:.\d+)?%/];
        const isFromTo = objectKeys.some(
            (key) => key.match("from") || key.match("to")
        );

        if (
            objectKeys.some(
                (key: string) =>
                    validKeys.filter((regex) => regex.test(key)).length ===
                    validKeys.length
            )
        )
            throw new Error(
                "Invalid key. Please use only from, to, and percentage values."
            );

        if (isFromTo && objectKeys.length > 2)
            throw new Error(
                "Expected only 'from' and 'to', got extra unnecessary values"
            );

        this.isFromTo = isFromTo;
        this._keyframes = objectKeys.reduce((acc, key) => {
            acc[key] = Style.toStyle(styleData[key]);
            return acc;
        }, {} as Record<string, Style[]>);
    }

    /**
     * @param {number} percentage - The percentage at which to add the stop.
     * @param {Style} style - The style to add at the stop.
     */
    public addStop(percentage: number | "from" | "to", style: CSSObject) {
        if (typeof percentage == "string")
            if (Object.keys(this._keyframes).every((key) => key.match("%")))
                this._keyframes = {
                    [percentage === "from" ? "from" : "to"]:
                        Style.toStyle(style),
                    [percentage === "from" ? "to" : "from"]: [],
                };

        if (this.isFromTo)
            throw new Error(
                "Cannot add stop to an Animation that has 'from' and 'to' values"
            );

        Object.assign(this._keyframes, {
            [`${percentage}%`]: Style.toStyle(style),
        });

        return true;
    }

    /**
     * @param percentage - The percentage at which to add the stop.
     * @returns {boolean} - True if the stop was added, false if it was not.
     */
    public removeStop(percentage: number) {
        if (this.isFromTo)
            throw new Error(
                "Cannot remove stop from an Animation that has 'from' and 'to' values"
            );

        const stopKey = `${percentage}%`;
        const stopKeyExists = Object.hasOwn(this._keyframes, stopKey);
        delete this._keyframes[`${percentage}%`];

        return !!stopKeyExists;
    }

    /**
     * @returns {string} - The keyframes for the animation.
     */
    public finalize(finalizeData?: AnimationOptions) {
        return `${emotion_keyframes(this.json())}${
            finalizeData
                ? ` ${finalizeData.iterations} ${
                    finalizeData.duration || "0.5s"
                } ${finalizeData.delay || "0s"} ${
                    finalizeData.easing || "ease"
                }`
                : ""
        }`;
    }

    /**
     *
     * @returns {object} - The keyframes for the animation.
     */
    public json() {
        return (Object.keys(this._keyframes) as string[]).reduce((acc, key) => {
            acc[key] = this._keyframes[key].reduce((cur, style) => {
                cur[style._key] = style._value;
                return cur;
            }, {} as CSSObject);

            return acc;
        }, {} as Record<string, CSSObject>);
    }

    public get stops() {
        return { ...this._keyframes };
    }

    private _keyframes: { [key: string]: Array<Style> };
    private isFromTo = false;
}
