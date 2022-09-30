import { Button, ButtonProps } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Back = (props: ButtonProps & { to?: string | null }) => {
    const coreButton = (
        <Button
            borderRadius="2px"
            backgroundColor="#fb8e84"
            color="whitesmoke"
            _hover={{
                bg: "#f88379",
            }}
            {...props}
        >
            {props.children ?? "Button"}
        </Button>
    );

    return props.to !== null ? (
        <Link to={props.to ?? "/library"}>{coreButton}</Link>
    ) : (
        coreButton
    );
};

export default Back;
