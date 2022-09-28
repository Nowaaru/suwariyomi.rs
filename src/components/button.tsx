import { Button, ButtonProps } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Back = (props: ButtonProps) => {
    return (
        <Link to="/library">
            <Button
                borderRadius={2}
                backgroundColor={"#fb8e84"}
                color="whitesmoke"
                _hover={{
                    bg: "#f88379",
                }}
                {...props}
            >
                Back
            </Button>
        </Link>
    );
};

export default Back;
