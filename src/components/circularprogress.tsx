import { useState, useEffect, useMemo } from "react";
import { StyleSheet, css } from "aphrodite";
import {
    CircularProgress as CircularProgressChakra,
    CircularProgressLabel,
    CircularProgressProps,
} from "@chakra-ui/react";

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
            {...Object.assign({ ...props }, { showTimeElapsed: undefined })}
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
