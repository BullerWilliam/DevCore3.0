import { PUBLIC_API_URL } from "$lib/resources/public-env";

const USERS_API_ROOT = `${PUBLIC_API_URL}/api/v1/users`;
const API_HEALTH_ROOT = `${PUBLIC_API_URL}/api/v1`;

const postJson = async (url, body) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(json?.error || `Request failed with ${response.status}`);
    }
    if (json?.error) {
        throw new Error(json.error);
    }

    return json;
};

const getJson = async url => {
    const response = await fetch(url);
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(json?.error || `Request failed with ${response.status}`);
    }
    if (json?.error) {
        throw new Error(json.error);
    }

    return json;
};

const popupCenterFeatures = () => {
    const width = 560;
    const height = 720;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));
    return `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
};

const expectedApiOrigin = (() => {
    try {
        return new URL(PUBLIC_API_URL).origin;
    } catch {
        return "";
    }
})();

const buildOauthPath = (mode, method) => {
    const route = mode === "signup" ? "createoauthaccount" : "loginoauthaccount";
    return `${USERS_API_ROOT}/${route}?method=${encodeURIComponent(method)}`;
};

const DevCoreAccountAPI = {
    async checkApiOnline() {
        const response = await fetch(API_HEALTH_ROOT);
        return response.ok;
    },

    async passwordLogin({ username, password, captchaToken }) {
        return postJson(`${USERS_API_ROOT}/passwordlogin`, {
            username,
            password,
            captcha_token: captchaToken,
        });
    },

    async createAccount({ username, password, email, birthday, country, captchaToken }) {
        return postJson(`${USERS_API_ROOT}/createAccount`, {
            username,
            password,
            email,
            birthday,
            country,
            captcha_token: captchaToken,
        });
    },

    async usernameExists(username) {
        return getJson(`${USERS_API_ROOT}/userexists?username=${encodeURIComponent(username)}`);
    },

    async sendResetPasswordEmail({ email, captchaToken }) {
        return postJson(`${USERS_API_ROOT}/resetpassword/sendEmail`, {
            email,
            captcha_token: captchaToken,
        });
    },

    openOauthPopup({ mode, method, onSuccess, onError }) {
        const popup = window.open(
            buildOauthPath(mode, method),
            `${mode}-${method}`,
            popupCenterFeatures()
        );

        if (!popup) {
            onError?.(new Error("PopupBlocked"));
            return () => {};
        }

        const handleMessage = event => {
            if (expectedApiOrigin && event.origin !== expectedApiOrigin) return;
            if (!event.data?.token) return;

            window.removeEventListener("message", handleMessage);
            onSuccess?.(event.data);
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
            if (!popup.closed) popup.close();
        };
    },
};

export default DevCoreAccountAPI;
