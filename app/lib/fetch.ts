import i18n from "~/lib/i18n";
import { LOCAL_LANGUAGE_HEADER_KEY } from "~/constant/common";

interface FetchOptions {
  apiEndpoint: string;
  shopifyEndpoint: string;
}

declare global {
  interface Window {
    __ENV?: {
      API_ENDPOINT?: string;
    };
  }
}

const createGlobalFetch = ({ apiEndpoint, shopifyEndpoint }: FetchOptions) => {
  return async (path: string, options: Record<string, any> = {}) => {
    const type = options?.type || "default";
    const endpoint = type === "ajax" ? shopifyEndpoint : apiEndpoint;
    const url = `${endpoint}${path}`;
    const headers = {
      // ...{
      //   "Content-Type": "application/json",
      // },
      ...{
        [LOCAL_LANGUAGE_HEADER_KEY]: i18n.language || "en",
      },
      ...(options.headers || {}),
    };

    console.log("options", options);
    console.log("headers", headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred");
    }

    const contentType = response.headers.get("content-type");

    if (type === "ajax") {
      if (contentType?.includes("application/javascript")) {
        const text = await response.text();
        const jsonStr = text.match(/callback\((.*)\)/)?.[1] || "{}";
        return JSON.parse(jsonStr);
      }
    }

    return response.json();
  };
};

export const getRuntimeApiEndpoint = () => {
  if (
    typeof window !== "undefined" &&
    window.__ENV &&
    window.__ENV.API_ENDPOINT
  ) {
    return window.__ENV.API_ENDPOINT;
  }
  return import.meta.env.VITE_PUBLIC_API_V1_ENDPOINT || "";
};

// export const getRuntimeApiEndpoint = () => {
//   if (
//     typeof window !== "undefined" &&
//     window.__ENV &&
//     window.__ENV.API_ENDPOINT &&
//     import.meta.env.MODE !== "development"
//   ) {
//     return window.__ENV.API_ENDPOINT;
//   }
//   return import.meta.env.VITE_PUBLIC_API_V1_ENDPOINT || "";
// };

const apiEndpoint = getRuntimeApiEndpoint();

const getShopifyEndpoint = async () => {
  // Check whether it is a local environment
  const isLocal = import.meta.env.MODE === "development";
  const storeName = localStorage.getItem("store-name");

  if (isLocal) {
    return (
      `http://localhost:3000/${storeName || "b2b-accelerator.myshopify.com"}` ||
      ""
    );
  }

  return `https://${storeName}` || "";
};

let globalFetchInstance: ReturnType<typeof createGlobalFetch> | null = null;

export const initGlobalFetch = async () => {
  if (!globalFetchInstance) {
    const shopifyEndpoint = await getShopifyEndpoint();
    globalFetchInstance = createGlobalFetch({
      apiEndpoint,
      shopifyEndpoint,
    });
  }
  return globalFetchInstance;
};

export const globalFetch = async (
  ...args: Parameters<ReturnType<typeof createGlobalFetch>>
) => {
  const fetchInstance = await initGlobalFetch();
  return fetchInstance(...args);
};
