/* eslint-disable no-global-assign */
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";

import _ from "lodash";
import * as logApi from "tauri-plugin-log-api";
import { format as prettyFormat } from "pretty-format";
import uninterfacedConsole from "util/console";

const mappedLogApi = _.mapValues(
    _.omit(logApi, "default"),
    (loggerFn, loggerKey) =>
        (...data: unknown[]) => {
            loggerFn(data.map((v) => prettyFormat(v)).join(" ")).finally(() => {
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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
