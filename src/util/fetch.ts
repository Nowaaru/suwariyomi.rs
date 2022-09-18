// super-shitty node-fetch shim
// but it'll do for now until we
// can get a realistic one

import { http } from "@tauri-apps/api";
import { Body, ResponseType } from "@tauri-apps/api/http";

class Request {
    constructor(url: string, fetchOptions?: Exclude<http.FetchOptions, "responseType"> ) {
        this.url = url;
        this._options = fetchOptions ?? this._options;
    }

    public json() {
        this._options.responseType = ResponseType.JSON;
        return this.request(this.url);
    }

    public binary() {
        this._options.responseType = ResponseType.Binary;
        return this.request(this.url);
    }

    public text() {
        this._options.responseType = ResponseType.Text;
        return this.request(this.url);
    }

    private async request(url: string): Promise<unknown> {
        return http.fetch(url, this._options).then((res) => {
            return res.data;
        });
    }

    private url: string;

    private _options: http.FetchOptions = {
        method: "GET"
    };
}

interface ResponseInterface {
    headers: Record<string, string>;
    rawHeaders: Record<string, Array<string>>;
    status: number;
    url: string;
    ok: boolean;
}

type FetchOptionMethodBody = {
    method: "POST" | "PUT";
    body: Body | undefined;
    headers: HeadersInit;
};

type FetchOptionMethodBodiless = {
    method: "GET";
    body: never;
    headers: HeadersInit;
};

type FetchOptions = FetchOptionMethodBodiless | FetchOptionMethodBody;

function fetch(url: string, fetchParams?: FetchOptions) {
    return Promise.resolve(new Request(url, fetchParams));
}

export default fetch;
