// import { css as ecss } from "@emotion/react";
import type { CSSProperties } from "react";

interface Styles {
    [key: string]: CSSProperties;
}

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

class StyleSheetObject {
    constructor(styles: Styles) {
        this.internals = { styles: {} };

        for (const identifier in styles) {
            /*
                Styles {
                    button_div: {
                        display: 'flex',
                        flexDirection: 'column',
                    }
                }
                */
            const styles_ref = styles[identifier];
            for (const style in styles_ref) {
                this.internals.styles[identifier] = new Style(
                    style as keyof CSSProperties,
                    styles_ref[style as keyof CSSProperties]
                );
            }
        }
    }

    public concat(object: StyleSheetObject) {
        this.internals.styles = {
            ...this.internals.styles,
            ...object.internals.styles,
        };
    }

    public internals: {
        styles: { [key: string]: Style };
    };
}

export class StyleSheet {
    static create(styles: Styles) {
        return new StyleSheetObject(styles);
    }
}
