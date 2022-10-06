import { Button as CButton, ButtonProps } from "@chakra-ui/react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";

const Button = (
    props: ButtonProps &
        (
            | { to?: string; onClick?: never }
            | { to?: never; onClick: ButtonProps["onClick"] }
        )
) => {
    const Navigate = useNavigate();

    return (
        <CButton
            borderRadius="2px"
            backgroundColor="#fb8e84"
            color="whitesmoke"
            _hover={{
                bg: "#f88379",
            }}
            onClick={
                props.onClick ??
                (() => {
                    if (props.to) return Navigate(props.to);

                    return Navigate(-1);
                })
            }
            {..._.omit(props, "onChange")}
        >
            {props.children ?? "Button"}
        </CButton>
    );
};

export default Button;
