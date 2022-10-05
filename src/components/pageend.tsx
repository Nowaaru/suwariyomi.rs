import { Stack, Text } from "@chakra-ui/react";

const PageEnd = ({
    icon = "🐰",
    text = "You've finally seen it all.",
}: {
    icon?: JSX.Element | string | null;
    text?: JSX.Element | string | null;
}) => (
    <Stack
        display="flex"
        minWidth="80vw"
        width="100%"
        marginBottom="64px"
        marginTop="32px"
        alignItems="center"
        color="#FFFFFF22"
        userSelect="none"
    >
        <Text
            fontSize="64px"
            filter="grayscale(100%) blur(0px) brightness(200%)"
        >
            {icon}
        </Text>
        <Text fontFamily="Cascadia Code">{text}</Text>
    </Stack>
);

export default PageEnd;
