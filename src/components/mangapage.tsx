import { CanvasHTMLAttributes, useEffect, useRef, useState } from "react";
import { StyleSheet, css } from "aphrodite";
import useForceUpdate from "hooks/forceupdate";
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

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "row",
                verticalAlign: "middle",
                alignItems: "center",
                backgroundColor: "#0D1620",
                width: "100vw",
                height: "100vh",
                padding,
            }}
        >
            <img src={url} className={css(styles.page)} />
        </div>
    );
};

export default MangaPage;
