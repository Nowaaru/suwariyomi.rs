import { MutableRefObject, useCallback, useEffect, useState } from "react";
import { Button, ButtonProps } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

import _ from "lodash";

const Card = (
    props: {
        className: string;
        children?: JSX.Element | JSX.Element[];
        leftIcon?: JSX.Element;
        rightIcon?: JSX.Element;
        scrollTarget?: MutableRefObject<HTMLElement | undefined | null>;
    } & ButtonProps
) => {
    const { leftIcon = <InfoIcon />, rightIcon, children = [] } = props;

    const [{ scrollDelta, scrollPosition }, setDelta] = useState<{
        scrollDelta: number | null;
        scrollPosition: number;
    }>({
        scrollDelta: 0,
        scrollPosition: props.scrollTarget?.current?.scrollTop ?? 0,
    });

    const { current: scrollTarget } = props.scrollTarget ?? {};
    const handleScroll = useCallback(
        _.throttle((oldPosition: number) => {
            if (!scrollTarget) return;

            const newPosition = scrollTarget.scrollTop;
            setDelta({
                scrollDelta: newPosition - oldPosition,
                scrollPosition: newPosition,
            });
        }, 100),
        [scrollTarget]
    );

    useEffect(() => {
        if (!scrollTarget) {
            if (scrollDelta) setDelta({ scrollDelta: null, scrollPosition });
            return;
        }

        const currentScrollPosition = scrollTarget.scrollTop;
        const callHandler = () => handleScroll(currentScrollPosition);

        scrollTarget.addEventListener("scroll", callHandler, { passive: true });

        return () => {
            scrollTarget.removeEventListener("scroll", callHandler);
        };
    }, [handleScroll, scrollTarget, scrollPosition, scrollDelta]);

    const buttonProps: ButtonProps = {};
    (
        Object.keys({
            ...props,
            scrollTarget: undefined,
        }) as Array<keyof ButtonProps>
    )
        .filter((k) => !_.isUndefined(k))
        .forEach((nk: keyof ButtonProps) => (buttonProps[nk] = props[nk]));

    const isAtTop = scrollPosition < (scrollTarget?.clientHeight ?? 1000) * 0.1;
    return (
        <Button
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            backgroundColor="#f88379"
            boxShadow={isAtTop ? "none" : "0 0 8px 2px #000000"}
            borderRadius="2px"
            opacity={
                Math.sign(scrollDelta ?? 0) !== 1 ? (isAtTop ? "1" : "0") : "1"
            }
            transition="opacity 0.2s, top 1s, boxShadow 0.2s"
            color="whitesmoke"
            _hover={{
                backgroundColor: "#fb8e84",
            }}
            {...buttonProps}
        >
            {children}
        </Button>
    );
};

export default Card;
