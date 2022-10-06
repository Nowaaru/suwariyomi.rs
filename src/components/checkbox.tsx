import { Checkbox, CheckboxProps } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import _ from "lodash";
import ripple from "ripple-effects";

const CheckboxRipple = (props: CheckboxProps) => {
    const ref = useRef<null | HTMLInputElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        ripple(ref.current);
    }, []);

    const checked = props.isChecked || props.isIndeterminate;
    return (
        <Checkbox
            onChange={(e) => {
                props.onChange?.(e);
            }}
            sx={{
                "& span.chakra-checkbox__control": {
                    borderColor: checked ? "#f8837955" : "white",
                    backgroundColor: checked ? "#f88379" : "transparent",

                    ":hover": {
                        borderColor: checked ? "#f88379" : "white",
                        backgroundColor: checked ? "#f88379" : "transparent",
                        filter: "brightness(1.2)",
                    },
                },
            }}
            ref={ref}
            {..._.omit(props, "onChange")}
        >
            {props.children}
        </Checkbox>
    );
};

export default CheckboxRipple;
