import { useState, useEffect, useMemo, MutableRefObject } from "react";

export default function useOnScreen(
    ref: MutableRefObject<HTMLElement | null>
): boolean {
    const [isIntersecting, setIntersecting] = useState(false);

    const observer = useMemo(
        () =>
            new IntersectionObserver(([entry]) =>
                setIntersecting(entry.isIntersecting)
            ),
        []
    );

    useEffect(() => {
        if (ref.current) observer.observe(ref.current);
        // Remove the observer as soon as the component is unmounted
        return () => {
            observer.disconnect();
        };
    }, [observer, ref]);

    return isIntersecting;
}
