import { useCallback, useMemo, useState } from "react";
import { StyleSheet, css } from "util/aphrodite";

type LightbarPropsVertical = {
    vertical: true;
    right?: boolean;
    top?: never;
};

type LightbarPropsHorizontal = {
    vertical?: false;
    right?: never;
    top?: boolean;
};

type LightbarTabProps = {
    pageNumber: number;
    selected?: boolean;
    onClick?: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        tab: number
    ) => void;

    barPosition?: "left" | "right" | "top" | "bottom";
};

type LightbarProps = (LightbarPropsVertical | LightbarPropsHorizontal) & {
    pages: number;
    current?: number;
    reversed?: boolean;
    onTabClick?: LightbarTabProps['onClick'];
};

const LightbarTab = (props: LightbarTabProps) => {
    const { barPosition = "bottom", pageNumber, onClick, selected } = props;
    const barSizeProfile =
        barPosition === "left" || barPosition === "right" ? "height" : "width";
    const oppBarSizeProfile = barSizeProfile === "height" ? "width" : "height";

    const selectedColor = "#fb8e84";
    const oppPosition = {
        bottom: "top",
        top: "bottom",
        left: "right",
        right: "left",
    }[barPosition];

    const selectedStyle = {
        content: "' '",
        position: "absolute",
        [barSizeProfile]: "100%",
        [oppBarSizeProfile]: "70%",
        [barPosition]: "-25%",
        transition: "background 0.15s ease-in",
        background: `linear-gradient(to ${oppPosition}, ${selectedColor}66, ${selectedColor}00)`,
    };
    const styles = useMemo(
        () =>
            StyleSheet.create({
                lightbarTab: {
                    display: "flex",
                    position: "relative", // to position the ::after properly
                    flexGrow: 1,

                    [barPosition]: selected ? "5%" : "0",
                    transition: `${barPosition} 0.15s ease-in`,
                    ":hover": {
                        "::before": selected ? {} : selectedStyle,
                        [barPosition]: "5%",
                        cursor: "pointer",
                    },
                    "::after": {
                        content: "' '",
                        position: "absolute",
                        [barPosition]: "0",
                        [barSizeProfile]: "calc(100% - 2px)",
                        [oppBarSizeProfile]: "4px",
                        backgroundColor: "#fb8e84",
                        boxSizing: "border-box",
                        boxShadow: "0px 0px #000000",
                        borderRadius: "4px",
                    },
                },
                gradientSelected: {
                    "::before": selectedStyle,
                },
                notSelected: {
                    opacity: 0,
                },
                lightbarNum: {
                    opacity: 1,
                    position: "absolute",
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: "32",
                    color: "white",
                    fontWeight: "100",
                    fontSize: "0.8rem",
                    fontFamily: "Cascadia Code",
                    transition: "opacity 0.15s ease-in-out",
                    userSelect: "none",
                    [oppPosition]: "8px",
                    ":hover": {
                        opacity: 1,
                    },
                },
            }),
        [props]
    );

    return (
        <div
            onClick={(e) => {
                if (onClick) onClick(e, pageNumber);
            }}
            className={css(styles.lightbarTab)}
        >
            <span
                className={css(
                    styles.lightbarNum,
                    selected ? styles.gradientSelected : false,
                    !selected && styles.notSelected
                )}
            >
                {pageNumber}
            </span>
        </div>
    );
};

const Lightbar = (props: LightbarProps) => {
    const {
        vertical: isVertical,
        right: isRight,
        top: isTop,
        onTabClick,
        current = 1,
        pages,
    } = props;
    if (pages <= 0) throw new Error("parameter pages is not zero-indexed");

    const lightbarColor = "#FFFFFF";
    const positioningParameter = useMemo(() => {
        let finalResult: string;
        if (isVertical) {
            if (isRight) return (finalResult = "right");

            return (finalResult = "left");
        }

        if (isTop) return (finalResult = "top");

        return (finalResult = "bottom");
    }, [props]);
    const oppPosition = {
        bottom: "top",
        top: "bottom",
        left: "right",
        right: "left",
    }[positioningParameter];

    const styles = useMemo(
        () =>
            StyleSheet.create({
                lightBar: {
                    display: "flex",
                    zIndex: "25",
                    position: "absolute",
                    justifyContent: "center",
                    top: isVertical ? "0px" : "unset",
                    flexDirection: isVertical ? "column" : "row",
                    [positioningParameter]: "0",
                    [isVertical ? "width" : "height"]: "8%",
                    [isVertical ? "height" : "width"]: "100%",

                    "::after": {
                        content: "' '",
                        position: "absolute",
                        [positioningParameter]: "0",
                        [isVertical ? "width" : "height"]: "60%",
                        [isVertical ? "height" : "width"]: "100%",

                        zIndex: -1,
                        background: `linear-gradient(to ${oppPosition}, ${lightbarColor}22, ${lightbarColor}00)`,
                    },
                },
            }),
        [isVertical, oppPosition, lightbarColor, positioningParameter]
    );

    const generateTabs = useCallback(() => {
        const lightbarTabs: Array<JSX.Element> = [];
        for (let i = 1; i <= pages; i++) {
            // I expect pages to not be zero-indexed for this case
            lightbarTabs.push(
                <LightbarTab
                    barPosition={positioningParameter}
                    pageNumber={i}
                    selected={i === current}
                    onClick={onTabClick}
                />
            );
        }

        return lightbarTabs;
    }, [LightbarTab, props]);

    return <div className={css(styles.lightBar)}>{generateTabs()}</div>;
};

export default Lightbar;
