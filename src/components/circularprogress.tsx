import {
    CircularProgress as CircularProgressChakra,
    CircularProgressLabel,
    CircularProgressProps,
} from "@chakra-ui/react";

import { css, StyleSheet } from "aphrodite";
import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
const CircularProgress = (
    props: Omit<
        CircularProgressProps,
        "isIndeterminate" | "capIsRound" | "sx"
    > & { showTimeElapsed?: boolean }
) => {
    const styles = useMemo(
        () =>
            StyleSheet.create({
                label: {
                    fontFamily: "Cascadia Code",
                    color: "whitesmoke",
                    padding: "6px",
                },
            }),
        []
    );

    const [time, setTime] = useState(0);
    useEffect(() => {
        if (!props.showTimeElapsed) return;
        const interval = setInterval(() => {
            setTime((curTime) => curTime + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [props]);

    return (
        <CircularProgressChakra
            isIndeterminate
            capIsRound
            sx={{
                "& > svg > .chakra-progress__indicator": {
                    stroke: "#fb8e84",
                },
            }}
            {..._(props).omit(["showTimeElapsed"]).value()}
        >
            {props.showTimeElapsed ? (
                <CircularProgressLabel className={css(styles.label)}>
                    {time}s
                </CircularProgressLabel>
            ) : null}
            {props.children ?? null}
        </CircularProgressChakra>
    );
};

export default CircularProgress;
