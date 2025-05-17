import { createClient } from "./api";

export const getQuarksInstance = () => {
    const baseUrl = PROXY_SERVER_URL;
    console.log('quarks base url:', baseUrl);
    return createClient({
        baseUrl,
        appId: QUARKSHUB_APP_ID || "skyharvest"
    });
}