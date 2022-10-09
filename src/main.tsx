/* eslint-disable no-global-assign */
import App from "./app";
import React from "react";
import ReactDOM from "react-dom/client";
import ThemeHandler from "util/theme";

import _ from "lodash";
import * as logApi from "tauri-plugin-log-api";
import { format as prettyFormat } from "pretty-format";
const uninterfacedConsole = _.cloneDeep(console);
const mappedLogApi = _.mapValues(
    _.omit(logApi, "default"),
    (loggerFn, loggerKey) =>
        (...data: unknown[]) => {
            loggerFn(prettyFormat(data)).finally(() => {
                const assumedLoggerFunction =
                    uninterfacedConsole[
                        loggerKey as Exclude<
                            keyof typeof uninterfacedConsole,
                            "ConsoleConstructor"
                        >
                    ] ?? uninterfacedConsole.log;

                if (typeof assumedLoggerFunction === "function")
                    (
                        assumedLoggerFunction as (
                            ...data: Array<unknown>
                        ) => void
                    )(...data);
            });
        }
);

globalThis.console = {
    ...uninterfacedConsole,
    ..._.omit(mappedLogApi, "trace", "attachConsole"),

    log: mappedLogApi.trace,
};

globalThis.ThemeHandler = ThemeHandler;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
