import SearchCache from "util/searchcache";
const Page = ({ children, id}: { children: JSX.Element, id: string }) => {
    switch (id) {
        case "View":
        case "Search":
            break;

        default: {
            SearchCache.set();
            SearchCache.scroll = undefined;
        }
    }

    return <>{children}</>;
};

export default Page;
