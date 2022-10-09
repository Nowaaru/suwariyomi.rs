import chroma, { Color as CColor } from "chroma-js";
import _ from "lodash";

export type Color = chroma.Color | string | number;
export type ThemeRequired = {
    background: Color;
    accentText: Color;

    accentObject?: Color;
} & { [k in string]: Color };
("#f88379");
const ThemeDefault = {
    background: "#0D1620",
    accentText: "#f88379",

    accentObject: "#fb8e84",
};

const convertToColors = (
    colors: ThemeRequired
): Record<string, chroma.Color> => {
    return _.mapValues(colors, (v) => chroma(v));
};

export class ThemeHandler {
    constructor(colors: ThemeRequired = ThemeDefault) {
        this._colors = Object.assign(
            convertToColors(ThemeDefault),
            convertToColors(colors)
        );
    }

    public color(colorId: keyof typeof this.colors): chroma.Color {
        if (this._colors[colorId]) return this._colors[colorId];

        return chroma("#000");
    }

    public colors() {
        return _.cloneDeep(this._colors);
    }

    public get chroma() {
        return chroma;
    }

    public apply(newColors: ThemeRequired) {
        this._colors = Object.assign(
            convertToColors(ThemeDefault),
            convertToColors(newColors)
        );

        return this;
    }

    private _colors: Record<string, chroma.Color>;
}

export default new ThemeHandler();
