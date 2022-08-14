import {
    css as emotion_css,
    keyframes as emotion_keyframes,
} from "@emotion/css";
import type { CSSProperties } from "react";
type Styles<T = unknown> = {
    [K in keyof T]: CSSProperties | Styles<T[K]>;
};
class Style {
    constructor(
        style: keyof CSSProperties,
        value: CSSProperties[keyof CSSProperties]
    ) {
        this._key = style;
        this._value = value;
    }

    public _key: keyof CSSProperties;
    public _value: CSSProperties[keyof CSSProperties];
}

export class StyleSheet {
    static create<TYPE>(styles: Styles<TYPE>): {
        [KEY in keyof TYPE]: Style;
    } {
        const result: Record<string, Style> = {};
        (Object.keys(styles) as (keyof TYPE)[]).forEach((key: keyof TYPE) => {
            result[key as string] = new Style(
                key as string as keyof CSSProperties,
                styles[key] as CSSProperties[keyof CSSProperties]
            );
        });

        return result as {
            [KEY in keyof TYPE]: Style;
        };
    }
}

export function css(...styles: (Style | false)[]) {
    const CSSValues: {
        [KEY in keyof CSSProperties]: CSSProperties[keyof CSSProperties];
    } = {};

    styles.forEach((style: Style | false) => {
        if (style) {
            CSSValues[style._key] = style._value;
        }
    });

    return emotion_css(...Object.values(CSSValues as Record<string, string>));
}

export const keyframes = emotion_keyframes;
