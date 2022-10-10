import { Flex } from "@chakra-ui/react";
import { css, StyleSheet } from "aphrodite";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import _ from "lodash";

type float = number;
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

type MangaAppearance = {
    baseZoom?: float; // TBA when I can be fucked to implement canvas-based manga pages because zooming and panning is a demonic thing to implement.
} & (MangaRoundedTrue | MangaRoundedFalse);

type MangaPageProps = (MangaBlob | MangaUrl) &
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
        const newImage = new Image();
        newImage.src = url;

        newImage.onload = () => {
            setImageData(newImage);
        };
    }, [url]);

    const canvas = useRef<HTMLCanvasElement>(null);
    useLayoutEffect(() => {
        if (!imageData) return;

        const ctx = canvas.current?.getContext("2d");
        ctx?.drawImage(
            imageData,
            0,
            0,
            imageData.naturalWidth,
            imageData.naturalHeight
        );
    }, [imageData]);

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
