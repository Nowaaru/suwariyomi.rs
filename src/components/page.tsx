const Page = ({ children, id}: { children: JSX.Element, id: string }) => {
    switch (id) {
        case "View":
        case "Search":
            break;

        default: {
            window.localStorage.removeItem("search_cache");
        }
    }

    return <>{children}</>;
};

export default Page;
