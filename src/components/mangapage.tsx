import { Flex } from "@chakra-ui/react";
import { css, StyleSheet } from "aphrodite";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import _ from "lodash";
import chroma from "chroma-js";

type MangaBlob = {
    blob: Blob;
    url?: never;
};
type MangaUrl = {
    blob?: never;
    url: string;
};

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
          filterColor: never;
          filterType: never;
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

type MangaAppearance = {
    baseZoom?: number; // TBA when I can be fucked to implement canvas-based manga pages because zooming and panning is a demonic thing to implement.
} & (MangaRoundedTrue | MangaRoundedFalse);

type MangaPageProps = (MangaBlob | MangaUrl) &
    MangaFilters &
    MangaAppearance & {
        fit?: "width" | "height" | "comfortable";
    };

const MangaPage = (props: MangaPageProps) => {
    const url = props.url || URL.createObjectURL(props.blob ?? new Blob());
    const isComfortable = props.fit === "comfortable";
    const padding = isComfortable ? "5%" : "0";
    const styles = StyleSheet.create({
        page: {
            borderRadius: props.rounded ? props.radius : "0px",
            [isComfortable ? "maxHeight" : `max${_.capitalize(props.fit)}`]:
                "100%",
        },
    });

    const [imageData, setImageData] = useState<HTMLImageElement | null>(null);
    useEffect(() => {
        if (imageData?.src === url) return;
        const newImage = new Image();
        newImage.src = url;

        newImage.onload = () => {
            setImageData(newImage);
        };
    }, [url, imageData]);

    const canvas = useRef<HTMLCanvasElement>(null);
    useLayoutEffect(() => {
        if (!imageData || !canvas.current) return;
        const ctx = canvas.current.getContext("2d");

        if (ctx) {
            ctx.drawImage(
                imageData,
                0,
                0,
                imageData.naturalWidth,
                imageData.naturalHeight
            );

            const { filterColor, filterType } = props;
            if (filterColor) {
                ctx.save();

                ctx.globalCompositeOperation = filterType;
                ctx.fillStyle = filterColor.hex();
                ctx.fillRect(
                    0,
                    0,
                    imageData.naturalWidth,
                    imageData.naturalHeight
                );

                ctx.restore();
            }
        }
    }, [imageData, props]);

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
        >
            <canvas
                width={imageData?.naturalWidth}
                height={imageData?.naturalHeight}
                className={css(styles.page)}
                ref={canvas}
            />
        </Flex>
    );
};

export default MangaPage;
