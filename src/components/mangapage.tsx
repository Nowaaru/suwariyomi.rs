import { Flex, useEditable } from "@chakra-ui/react";
import { css, StyleSheet } from "aphrodite";
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import console from "util/console";
import type { Page } from "pages/reader";

import _, { clamp } from "lodash";
import chroma from "chroma-js";
import useForceUpdate from "util/hook/forceupdate";

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

interface CanvasProps {
    zoomFactor?: number;
    panRate?: number;
    maxZoom?: number;
    minZoom?: number;
    onZoomChange?: (zoomFactor: number) => void;
    onPanChange?: (panX: number, panY: number) => void;
}

type MangaPageBase = {
    page: Page;
    debug?: boolean;
    reset?: [boolean, Dispatch<SetStateAction<boolean>>];
};

type MangaAppearance = {
    baseZoom?: number; // TBA when I can be fucked to implement canvas-based manga pages because zooming and panning is a demonic thing to implement.
} & (MangaRoundedTrue | MangaRoundedFalse);

type MangaPageProps = CanvasProps &
    MangaPageBase &
    MangaFilters &
    MangaAppearance & {
        fit?: "width" | "height" | "comfortable";
    };

const MangaPage = (props: MangaPageProps) => {
    const { page } = props;
    const { bitmap } = page;

    const {
        zoomFactor = 0.25,
        panRate = 1,
        maxZoom = 4,
        onZoomChange,
        onPanChange,
    } = props;

    const isComfortable = props.fit === "comfortable";
    const comfortableMargin = isComfortable ? 0.9 : 1;
    const padding = isComfortable ? "5%" : "0";

    const [[panX, panY], setPan] = useState<readonly [number, number] | []>([]);
    const [panner, setPanner] =
        useState<React.MouseEvent<HTMLCanvasElement, MouseEvent>>();
    
    const [zoom, setZoom] = useState(props.baseZoom ?? 1);

    const styles = StyleSheet.create({
        page: {
            borderRadius: props.rounded ? props.radius : "0px",
            // [isComfortable ? "maxHeight" : `max${_.capitalize(props.fit)}`]:
            //    "100%",
        },
    });

    useEffect(() => {
        // on mount, reset zoom and pan
        const [reset, setReset] = props.reset ?? [false, () => void 0];
        console.log(props);
        console.log("FFFFF", reset);
        if (reset) {
            const { baseZoom } = props;
            setReset(false);
            setZoom(baseZoom ?? 1);
            setPan([]);
        }
    }, [props]);

    const canvas = useRef<HTMLCanvasElement>(null);
    const imagePositioningData = (() => {
        if (!bitmap || !canvas.current) return;
        const { innerWidth: windowWidthInner, innerHeight: windowHeightInner } =
            window;

        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;

        //x clamp left is the bitmap width
        //x clamp right is the window width - bitmap width

        const [bitmapWidth, bitmapHeight] = [bitmap.width, bitmap.height].map(
            (x) =>
                x *
                comfortableMargin *
                Math.min(
                    ctx.canvas.width / bitmap.width,
                    ctx.canvas.height / bitmap.height
                )
        );

        const [xMin, xMax] = [
            ctx.canvas.width / 2 - bitmapWidth * zoom,
            ctx.canvas.width / 2,
        ];

        const [yMin, yMax] = [
            ctx.canvas.height / 2 - bitmapHeight * zoom,
            ctx.canvas.height / 2,
        ];

        const [bitmapCenterX, bitmapCenterY] = [
            xMin + bitmapWidth / 2,
            yMin + bitmapHeight / 2,
        ].map((y) => y * zoom);

        return {
            ctx,
            bitmap,

            windowWidthInner,
            windowHeightInner,

            xMin,
            xMax,

            bitmapCenterX,
            bitmapCenterY,

            yMin,
            yMax,

            minZoom: 1,
            bitmapWidth,
            bitmapHeight,
        };
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!bitmap || !canvas.current) return;
        if (!imagePositioningData) return;
        if (panX === undefined || panY === undefined) {
            setPan([
                imagePositioningData.bitmapCenterX,
                imagePositioningData.bitmapCenterY,
            ]);

            return;
        }

        const ctx = canvas.current.getContext("2d");
        const {
            windowWidthInner,
            windowHeightInner,
            bitmapWidth,
            bitmapHeight,
        } = imagePositioningData;

        if (ctx) {
            ctx.restore();
            ctx.clearRect(0, 0, windowWidthInner, windowHeightInner);

            ctx.save();
            ctx.translate(panX, panY);
            ctx.scale(zoom, zoom);

            ctx.beginPath();
            ctx.roundRect(
                0,
                0,
                bitmapWidth * 1,
                bitmapHeight * 1,
                props.rounded ? props.radius : 0
            );
            ctx.clip();
            ctx.drawImage(bitmap, 0, 0, bitmapWidth, bitmapHeight);

            ctx.translate(-panX, -panY);
            ctx.restore();

            if (panner && props.debug) {
                const { canvas } = ctx;

                ctx.fillStyle = "#0F0";
                ctx.fillRect(canvas.width / 2, canvas.height / 2, 4, 3);

                ctx.fillStyle = "#F00";
                ctx.fillRect(
                    panX + (bitmapWidth * zoom) / 2,
                    panY + (bitmapHeight * zoom) / 2,
                    4,
                    3
                );
            }

            const { filterColor, filterType } = props;
            if (filterColor) {
                ctx.save();
                ctx.globalCompositeOperation = filterType;
                ctx.fillStyle = filterColor.hex();
                ctx.fillRect(panX, panY, bitmapWidth, bitmapHeight);
                ctx.restore();
            }
        }
    });

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
            if (!panner) return;
            if (panner.button === 2) return;
            if (!imagePositioningData) return;

            const { movementX, movementY } = e;
            const { xMin, xMax, yMin, yMax } = imagePositioningData;

            setPan(([x, y]) => {
                const t = [
                    clamp((x as number) + movementX * panRate, xMin, xMax),
                    clamp((y as number) + movementY * panRate, yMin, yMax),
                ] as [number, number];

                return [t[0], t[1]];
            });
        },
        [imagePositioningData, panRate, panner]
    );

    const handleWheel = useCallback(
        (e: React.WheelEvent<HTMLCanvasElement>) => {
            if (!imagePositioningData) return;
            if (panX === undefined || panY === undefined) return;

            const { deltaY, clientX, clientY } = e;
            const {
                bitmapWidth,
                bitmapHeight,
                minZoom,
                xMin,
                xMax,
                yMin,
                yMax,
            } = imagePositioningData;

            const zoomCenterX = (clientX - panX) / (bitmapWidth * zoom);
            const zoomCenterY = (clientY - panY) / (bitmapHeight * zoom);

            setZoom((zoom) => {
                const newZoom = Math.max(
                    minZoom,
                    Math.min(maxZoom, zoom - Math.sign(deltaY) * zoomFactor)
                );

                setPan(([x, y]) => [
                    clamp(
                        (x as number) -
                            zoomCenterX * (newZoom - zoom) * bitmapWidth,
                        xMin,
                        xMax
                    ),
                    clamp(
                        (y as number) -
                            zoomCenterY * (newZoom - zoom) * bitmapHeight,
                        yMin,
                        yMax
                    ),
                ]);

                return newZoom;
            });
        },
        [imagePositioningData, maxZoom, zoomFactor, panX, panY, zoom]
    );

    useEffect(() => {
        window.addEventListener("resize", useForceUpdate);
    }, []);

    useEffect(() => {
        const onMouseLeaveWindow = () => setPanner(undefined);
        document.addEventListener("mouseleave", onMouseLeaveWindow);

        return () =>
            document.removeEventListener("mouseleave", onMouseLeaveWindow);
    }, []);

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
            key={props.page.url.href}
        >
            {bitmap ? (
                <canvas
                    className={css(styles.page)}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    onWheel={handleWheel}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseMove={handleMouseMove}
                    onMouseDown={(e) => {
                        if (e.button === 1) {
                            if (!imagePositioningData) return;
                            if (panner) {
                                setPanner(undefined);
                            }
                            // console.log("booyah");
                            e.preventDefault();
                            e.stopPropagation();

                            setPan([]);
                            setZoom(imagePositioningData.minZoom);
                        }
                        setPanner(e);
                    }}
                    onMouseUp={() => setPanner(undefined)}
                    ref={canvas}
                />
            ) : (
                <span>No bitmap.</span>
            )}
        </Flex>
    );
};

export default MangaPage;
