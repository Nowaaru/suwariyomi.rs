import { Flex } from "@chakra-ui/react";
import { css, StyleSheet } from "aphrodite";
import { useLayoutEffect, useRef } from "react";
import type { Page } from "pages/reader";

import _ from "lodash";
import chroma from "chroma-js";

type MangaRoundedTrue = {
    rounded: true;
    radius: number;
};

type MangaRoundedFalse = {
    rounded?: false;
    radius?: never;
};

type MangaFilters =
    | {
          filterColor: chroma.Color;
          filterType: FilterType;
      }
    | {
          filterColor?: never;
          filterType?: never;
      };

export enum FilterType {
    Multiply = "multiply",
    Screen = "screen",
    Overlay = "overlay",
    Darken = "darken",
    Lighten = "lighten",
    Dodge = "color-dodge",
    Burn = "color-burn",
    Subtract = "difference",
    Color = "color",
    Hue = "hue",
    Saturation = "saturation",
    Exclusion = "exclusion",
}

type MangaPageBase = {
    page: Page;
};

type MangaAppearance = {
    baseZoom?: number; // TBA when I can be fucked to implement canvas-based manga pages because zooming and panning is a demonic thing to implement.
} & (MangaRoundedTrue | MangaRoundedFalse);

type MangaPageProps = MangaPageBase &
    MangaFilters &
    MangaAppearance & {
        fit?: "width" | "height" | "comfortable";
    };

const MangaPage = (props: MangaPageProps) => {
    const { bitmap } = props.page;
    const isComfortable = props.fit === "comfortable";
    const padding = isComfortable ? "5%" : "0";
    const styles = StyleSheet.create({
        page: {
            borderRadius: props.rounded ? props.radius : "0px",
            [isComfortable ? "maxHeight" : `max${_.capitalize(props.fit)}`]:
                "100%",
        },
    });

    const canvas = useRef<HTMLCanvasElement>(null);
    useLayoutEffect(() => {
        if (!bitmap || !canvas.current) return;
        const ctx = canvas.current.getContext("2d");

        if (ctx) {
            ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

            const { filterColor, filterType } = props;
            if (filterColor) {
                ctx.save();

                ctx.globalCompositeOperation = filterType;
                ctx.fillStyle = filterColor.hex();
                ctx.fillRect(0, 0, bitmap.width, bitmap.height);

                ctx.restore();
            }
        }
    }, [bitmap, props]);

    return (
        <Flex
            justifyContent="center"
            flexDirection="row"
            verticalAlign="middle"
            alignItems="center"
            backgroundColor="#0D1620"
            position="relative"
            width="100%"
            height="100%"
            padding={padding}
            key={props.page.url}
        >
            {bitmap ? (
                <canvas
                    width={bitmap.width}
                    height={bitmap.height}
                    className={css(styles.page)}
                    ref={canvas}
                />
            ) : (
                <span>No bitmap.</span>
            )}
        </Flex>
    );
};

export default MangaPage;
