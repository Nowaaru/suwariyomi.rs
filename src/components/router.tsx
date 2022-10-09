import { BrowserHistory } from "history";
import { Router, BrowserRouterProps } from "react-router-dom";
import { useState, useLayoutEffect, useEffect } from "react";

import SearchCache from "util/searchcache";

const ReaderRouter = ({
    history,
    ...props
}: BrowserRouterProps & { history: BrowserHistory }) => {
    const [state, setState] = useState({
        action: history.action,
        location: history.location,
    });

    useEffect(() => {
        switch (props.basename) {
            case "View":
            case "Reader":
            case "Search":
                break;

            default: {
                SearchCache.set();
                SearchCache.scroll = undefined;
            }
        }
    });

    useLayoutEffect(() => history.listen(setState), [history]);

    return (
        <Router
            {...props}
            location={state.location}
            navigationType={state.action}
            navigator={history}
        />
    );
};

export default ReaderRouter;
