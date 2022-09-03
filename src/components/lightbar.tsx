import { useCallback, useMemo } from "react";
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
    pageNumber: number,
    selected?: boolean,
    onClick?: () => void,

    barPosition?: "left" | "right" | "top" | "bottom";
};

type LightbarProps = (LightbarPropsVertical | LightbarPropsHorizontal) & {
    pages: number,
    current?: number,
    reversed?: boolean,
};

const LightbarTab = (props: LightbarTabProps) => {
    const { barPosition = "bottom", selected } = props;
    const barSizeProfile = (barPosition === "left" || barPosition === "right") ? "height" : "width";
    const oppBarSizeProfile = barSizeProfile === "height" ? "width" : "height";

    const styles = useMemo(
        () =>
            StyleSheet.create({
                lightbarTab: {
                    display: "flex",
                    position: "relative", // to position the ::after properly
                    flexGrow: 1,

                    [barPosition]: selected ? "25%" : "unset",
                    "::after": {
                        content: "' '",
                        position: "absolute",
                        [barPosition]: "0",
                        [barSizeProfile]: "calc(100% - 2px)",
                        [oppBarSizeProfile]: "4px",
                        backgroundColor: "#fb8e84",
                        boxSizing: "border-box",
                    }
                },
            }),
        [props]
    );

    return <div className={css(styles.lightbarTab)} />;
};

const Lightbar = (props: LightbarProps) => {
    const { vertical: isVertical, right: isRight, top: isTop, current = 1, pages } = props;
    if (pages <= 0) throw new Error("parameter pages is not zero-indexed");

    const positioningParameter = useMemo(() => {
        let finalResult: string;
        if (isVertical) {
            if (isRight)
                return finalResult = "right"

            return finalResult = "left";
        }

        if (isTop)
            return finalResult = "top";

        return finalResult = "bottom";
    }, [props])

    const styles = useMemo(
        () =>
            StyleSheet.create({
                lightBar: {
                    display: "flex",
                    position: "absolute",
                    justifyContent: "center",
                    [positioningParameter]: "0",
                    [isVertical ? "width" : "height"]: "8%",
                    [isVertical ? "height" : "width"]: "100%",
                },
            }),
        []
    );

    const generateTabs = useCallback(() => {
        const lightbarTabs: Array<JSX.Element> = [];
        for (let i = 1; i < pages; i++ ) { // I expect pages to not be zero-indexed for this case
            lightbarTabs.push(<LightbarTab pageNumber={i} selected={i === current} onClick={() => console.log(`Page ${i} selected.`)} />)
        }

        return lightbarTabs;
    }, [LightbarTab, props])

    return (
        <div className={css(styles.lightBar)}>
            {generateTabs()}
        </div>
    );
};

export default Lightbar;
