class PenguinModAPIError extends Error {
    static UNKNOWN = "Unknown";
    static UNKNOWN_CODE = 0;
    static ASSERT_FAILED = -1;

    constructor(message, detail, httpCode, data, parsingError = false, url, request, response, error) {
        super(message);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PenguinModAPIError);
        }

        this.name = "PenguinModAPIError";
        this.message = message;
        this.cause = error;
        this.detail = String(detail ?? "");
        this.data = data;
        this.httpCode = httpCode;
        this.parsing = parsingError;
        this.url = url;
        this.request = request;
        this.response = response;
    }

    toString() {
        const code = this.httpCode && this.httpCode !== PenguinModAPIError.UNKNOWN_CODE
            ? ` [${this.httpCode}]`
            : "";
        return `${this.message}${code} - ${this.detail.trim()} at ${this.url}`;
    }
}

const RequestType = {
    None: "none",
    Text: "text",
    JSON: "json"
};

const safeParseJSON = (possibleJson, forceObject = false) => {
    try {
        return JSON.parse(possibleJson);
    } catch {
        return forceObject ? {} : possibleJson;
    }
};

const assert = (value, url, message = "AssertFailed", detail = "Assert failed.") => {
    if (!value) {
        throw new PenguinModAPIError(
            message,
            detail,
            PenguinModAPIError.ASSERT_FAILED,
            null,
            false,
            url,
            null,
            null,
            null
        );
    }
};

const doBasicRequest = async (url, options, apiClass, requestType) => {
    if (!apiClass) throw new Error("Provide apiClass to doBasicRequest");

    const injected = apiClass.injectOptions(options, url);
    const requestOptions = injected ? { ...injected } : {};
    const headers = {
        ...(injected?.headers ?? {}),
        "PenguinMod-Tooling": "PenguinMod-HomeNew"
    };
    requestOptions.headers = headers;

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            const text = await response.text();
            const jsonResp = safeParseJSON(text);
            const errorMsg = jsonResp && jsonResp.error ? jsonResp.error : text || PenguinModAPIError.UNKNOWN;
            throw new PenguinModAPIError(
                errorMsg,
                text,
                response.status,
                jsonResp,
                false,
                url,
                requestOptions,
                response,
                null
            );
        }

        if (requestType === RequestType.None) {
            return response;
        }

        const text = await response.text();
        if (requestType === RequestType.JSON) {
            try {
                return JSON.parse(text);
            } catch (error) {
                throw new PenguinModAPIError(
                    "ParseJSONFailed",
                    error,
                    response.status,
                    text,
                    true,
                    url,
                    requestOptions,
                    response,
                    error
                );
            }
        }

        return text;
    } catch (error) {
        if (error instanceof PenguinModAPIError) {
            throw error;
        }

        throw new PenguinModAPIError(
            "FetchFailed",
            error,
            PenguinModAPIError.UNKNOWN_CODE,
            null,
            false,
            url,
            requestOptions,
            null,
            error
        );
    }
};

class PenguinModAPIUsers {
    constructor(parent) {
        this._parent = parent;
    }

    async getInfo() {
        const url = `${this._parent.apiUrl}/v1/users/getinfo?token=${encodeURIComponent(this._parent.token)}`;
        assert(!!this._parent.token, url, "Reauthenticate", "No token is registered.");
        return await doBasicRequest(url, null, this._parent, RequestType.JSON);
    }

    async getMyFeed() {
        const url = `${this._parent.apiUrl}/v1/users/getmyfeed?token=${encodeURIComponent(this._parent.token)}`;
        assert(!!this._parent.token, url, "Reauthenticate", "No token is registered.");
        const feed = await doBasicRequest(url, null, this._parent, RequestType.JSON);
        return feed.feed;
    }

    getPfpUrl(username) {
        return `${this._parent.apiUrl}/v1/users/getpfp?username=${encodeURIComponent(username)}`;
    }

    async logout() {
        const url = `${this._parent.apiUrl}/v1/users/logout`;
        assert(!!this._parent.token, url, "Reauthenticate", "No token is registered.");
        await doBasicRequest(
            url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: this._parent.token
                })
            },
            this._parent,
            RequestType.None
        );
    }
}

class PenguinModAPIProjects {
    constructor(parent) {
        this._parent = parent;
    }

    getProjectThumbnailURL(projectId) {
        return `${this._parent.apiUrl}/v1/projects/getproject?projectID=${encodeURIComponent(projectId)}&requestType=thumbnail`;
    }

    async getFrontPage(login) {
        const url = new URL(`${this._parent.apiUrl}/v1/projects/frontpage`);
        if (login !== false && this._parent.token) {
            url.searchParams.set("token", this._parent.token);
        }

        return await doBasicRequest(url.toString(), null, this._parent, RequestType.JSON);
    }
}

class PenguinModAPI {
    constructor(options = {}) {
        this.token = options.token;
        this.apiUrl = options.apiUrl || "https://projects.penguinmod.com/api";
        this.users = new PenguinModAPIUsers(this);
        this.projects = new PenguinModAPIProjects(this);
    }

    setToken(token) {
        this.token = token;
    }

    injectOptions(options) {
        return options;
    }
}

export { PenguinModAPI, PenguinModAPIError };
