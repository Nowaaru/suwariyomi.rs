import chroma, { Color as CColor } from "chroma-js";
import _ from "lodash";

export type Color = CColor | string | number;
export type ThemeRequired = {
    background: Color;
    accent: Color;
} & { [k in string]: Color };

const ThemeDefault = {
    background: "#0D1620",
    accent: "#fb8e84",
};

const convertToColors = (colors: ThemeRequired) => {
    Object.values(colors).map((v: Color) => chroma(v));
    return colors;
};

class ThemeHandler {
    constructor(colors: ThemeRequired = ThemeDefault) {
        this._colors = convertToColors(_.cloneDeep(colors));
    }

    public color(colorId: keyof typeof this.colors) {
        if (this._colors[colorId])
            return _.cloneDeep(this._colors[colorId]);
    }

    public colors() {
        return _.cloneDeep(this._colors);
    }

    public get chroma() {
        return chroma;
    }

    public apply(newColors: ThemeRequired) {
        this._colors = {
            ...ThemeDefault,
            ...convertToColors(newColors),
        };

        return this;
    }

    private _colors: ThemeRequired;
}

export default new ThemeHandler();
