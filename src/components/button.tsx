import { Button as CButton, ButtonProps } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Button = (
    props: ButtonProps &
        (
            | { to?: string; onClick?: never }
            | { to?: never; onClick: ButtonProps["onClick"] }
        )
) => {
    const coreButton = (
        <CButton
            borderRadius="2px"
            backgroundColor="#fb8e84"
            color="whitesmoke"
            _hover={{
                bg: "#f88379",
            }}
            {...props}
        >
            {props.children ?? "Button"}
        </CButton>
    );

    return !props.onClick ? (
        <Link to={props.to ?? "/library"}>{coreButton}</Link>
    ) : (
        coreButton
    );
};

export default Button;
