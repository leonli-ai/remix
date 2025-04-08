import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import yaml from "@rollup/plugin-yaml";

installGlobals({ nativeFetch: true });

// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
// Replace the HOST env var with SHOPIFY_APP_URL so that it doesn't break the remix server. The CLI will eventually
// stop passing in HOST, so we can remove this workaround after the next major release.
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost")
  .hostname;

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: parseInt(process.env.FRONTEND_PORT!) || 8002,
    clientPort: 443,
  };
}

export default defineConfig({
  base: "/apps/customer-account/",
  server: {
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    fs: {
      // See https://vitejs.dev/config/server-options.html#server-fs-allow for more information
      allow: ["app", "node_modules"],
    },
    ...(process.env.NODE_ENV === "development" && {
      proxy: {
        "^/b2b-accelerator.myshopify.com/(.*)": {
          target: "https://b2b-accelerator.myshopify.com",
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) =>
            path.replace(/^\/b2b-accelerator\.myshopify\.com/, ""),
          configure: (proxy, _options) => {
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              proxyReq.setHeader(
                "accept",
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              );
              proxyReq.setHeader(
                "accept-language",
                "en-US,en;q=0.9,es;q=0.8,zh-CN;q=0.7,zh;q=0.6",
              );
              proxyReq.setHeader("cache-control", "no-cache");
              proxyReq.setHeader("pragma", "no-cache");
              proxyReq.setHeader("priority", "u=0, i");
              proxyReq.setHeader("Host", "b2b-accelerator.myshopify.com");
              proxyReq.setHeader(
                "Origin",
                "https://b2b-accelerator.myshopify.com",
              );
              proxyReq.setHeader(
                "Referer",
                "https://b2b-accelerator.myshopify.com/products/the-complete-snowboard?_pos=1&_psq=s&_ss=e&_v=1.0",
              );
              proxyReq.setHeader(
                "sec-ch-ua",
                '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
              );
              proxyReq.setHeader("sec-ch-ua-mobile", "?0");
              proxyReq.setHeader("sec-ch-ua-platform", '"macOS"');
              proxyReq.setHeader("sec-fetch-dest", "document");
              proxyReq.setHeader("sec-fetch-mode", "navigate");
              proxyReq.setHeader("sec-fetch-site", "same-origin");
              proxyReq.setHeader(
                "Referer",
                "https://b2b-accelerator.myshopify.com/products/the-complete-snowboard",
              );
              proxyReq.setHeader("accept", "application/json");
              proxyReq.setHeader("accept-language", "en-US,en;q=0.9");
              proxyReq.setHeader(
                "cookie",
                '_shopify_y=639ae2f8-4d94-472d-b27e-07335d9301e7; localization=US; skip_shop_pay=false; swym-pid="wXCp7lXNtIm2XUEby2+gh+kLhRhO5Tx34sSf/CDHsAU="; swym-swymRegid="eOtlVjig6b2P6dSCX9uIIR1eEz4Ac0QJVxvETchx0JLJwHOTZuI2Fm6hm0A473pACvFbD6x5DWRgy4QM3zJ68qX_HbFn8MH_nlUrPARJcbE7hm6_HrXLQTjtGC0aBfrJOoPWZKiVzWPm_N6oKzzxNHsZvNuFtS9sb6YVMYqJevg"; swym-email=null; cart_currency=USD; checkout_session_token__cn__Z2NwLXVzLWNlbnRyYWwxOjAxSkZSUDgxTUtLVlpDRjE0UlZZUFg1QUdE=%7B%22token%22%3A%22WlR0L0RjNjJtaVdqc2FtYVVIWlBBbXZhQ1cxUUZnRWkyWHkyQldySk0wM2g3UVFIaU9kd3ZUWTJubkRkVDMzWTQ5ODg2d2Q0UzZNbFp2dzlPT083VGNxeWZjelQyZGhuejFNRFA4RklSaXJGQ0dsR2kxQkRvRmw1NXMwSmFJU1pRVER3Z2dQMDRRYUt3QjQ4TElpVFZDSnRaTkxwa2xGb2pQSXVpcmkrZURITWZET1EyV0JiUUg3U3ZZY0cxSEI3YzBnK01pWktwMWhYeXd0eW5XRzBPNzkveUJXT2NGRzV4T0F5MFM2V0lxSHBvdk0ySEdrN1BlR2lONStsWUIvakhhTUFZRFBqT3grdVZLdzB4N1pkcGIycVowVWxjZHdDVnNwamxtQjlhcjl0WW54TUNFTVctLU5odk03YVZKUHRJeVNtSC8tLW90V2tGYXJUYXc5SGd5OXY0SnRsY3c9PQ%22%2C%22locale%22%3A%22en-US%22%2C%22checkout_session_identifier%22%3A%22051abe250dac171fdea4c8d4f8e74e6b%22%7D; locale_bar_accepted=1; _tracking_consent=%7B%22con%22%3A%7B%22CMP%22%3A%7B%22a%22%3A%22%22%2C%22m%22%3A%22%22%2C%22p%22%3A%22%22%2C%22s%22%3A%22%22%7D%7D%2C%22v%22%3A%222.1%22%2C%22region%22%3A%22USCA%22%2C%22reg%22%3A%22%22%2C%22purposes%22%3A%7B%22a%22%3Atrue%2C%22p%22%3Atrue%2C%22m%22%3Atrue%2C%22t%22%3Atrue%7D%2C%22display_banner%22%3Afalse%2C%22sale_of_data_region%22%3Atrue%2C%22consent_id%22%3A%221051BA20-246e-4911-a1f3-2d13c00ee3c8%22%7D; storefront_digest=81ecb6a3871e9100ed2f7fa324c546fe7c430820e9cecc59a0dfd57a49ee4e4e; cart=Z2NwLXVzLWNlbnRyYWwxOjAxSkdKRVg1SzkyVjZaQ1NSUFFUODlaRktH%3Fkey%3De33bb774468bc3f3ae1c7b0fabff566b; checkout_session_token__cn__Z2NwLXVzLWNlbnRyYWwxOjAxSkZTNTFGWTdEQUVXTlZKOEpEUUMyRUo4=%7B%22token%22%3A%22aU03QmFuS0dJakNnYzBDaWExb1h2ZTFrV09oUExWS3VuUVNvczQxT1hha0tEUGpJNHg5VWFNR0x0RnQ0NUI4RnVCeEczRlVNOEM4QnlXalEzUjdySTBpM3d5aXdjMkU2bWdJb2c3VU9yUzZSMXZaTmtPL0RObGw2M2k4bVFSS1hWTE1CTzlXbTQwYjJrV1ZXWFVzdGk2c1ZTbWRzcy81Qkl6WDZES0I5QkhsMWV5Y05EbWtUYkU0NlhjNXhlMHY1TGw1bk1VSnR2Y3pVeU81cEtEckFjZkFoeHNWZ1hBYlJHeHpJYTQ1SlFBMFc4b1ZLdUpEZFZLZm0wK0piNm5leGhoVjc4aU1Nbi9CczZaL1ZWK0ladms1aThpMHdEV3VRdEM4MnN1Tm90c0ROalRiV2h1MzMtLThpRktremZoR09Wb3NIdVctLU41Wml4cWZDOHN2aTB3MUZtdWMwcFE9PQ%22%2C%22locale%22%3A%22en-US%22%2C%22checkout_session_identifier%22%3A%2236999ca61674c3e8133683ef3cd255bb%22%7D; checkout_session_token__cn__Z2NwLXVzLWNlbnRyYWwxOjAxSkdKRVg1SzkyVjZaQ1NSUFFUODlaRktH=%7B%22token%22%3A%22cDJNVzE5ZlF0QVhYQUoralMwVVJ5RWZEQ3gxL3lRMFpOL1A3WVF2WWRFVE9vODJseU5ZMXlkNDNlZkZrb0dENk5QZFI4VXpTZ1JDenJiSW9WVXYwZnB1R3huNHlCNXBrdjdkajd4UG9lcFJjR3pvaVRaK05tNWJ3VG43dC9HaU1weTZOMmdEeUU0clBsajAvWVhiNzlsYmF3a01LZmFEN1lUc1NtZVBaaUJUMlkrV3J6V2ZDbGhIREV3VjRMaWxjRmEyeGpjMkt3YTJXOTdSMm5mQnEraTRWVm5JaXdqeGpoS0Q0K1JpazVpUGdRUGVQYlhrS1lkdE5iT3FtbzgyelZTeG83cFVTY2J3V0NqWTRWK1k2WWpPVnZMUS93Q1pXK05xMERRVnN0ZEU0QVFWUlFYT28tLVpVc01NVTN6eGhSZ0NmMWQtLTM1a005Wkp4V3JvY2Nhb1gzeUdZVkE9PQ%22%2C%22locale%22%3A%22en-US%22%2C%22checkout_session_identifier%22%3A%223d38706b112d0404cbc5d6abfc8f3cd7%22%7D; checkout_session_lookup=%7B%22version%22%3A1%2C%22keys%22%3A%5B%7B%22source_id%22%3A%22Z2NwLXVzLWNlbnRyYWwxOjAxSkZSUDgxTUtLVlpDRjE0UlZZUFg1QUdE%22%2C%22checkout_session_identifier%22%3A%22051abe250dac171fdea4c8d4f8e74e6b%22%2C%22source_type_abbrev%22%3A%22cn%22%2C%22updated_at%22%3A%222024-12-23T02%3A41%3A35.617Z%22%7D%2C%7B%22source_id%22%3A%22Z2NwLXVzLWNlbnRyYWwxOjAxSkZTNTFGWTdEQUVXTlZKOEpEUUMyRUo4%22%2C%22checkout_session_identifier%22%3A%2236999ca61674c3e8133683ef3cd255bb%22%2C%22source_type_abbrev%22%3A%22cn%22%2C%22updated_at%22%3A%222024-12-23T06%3A59%3A59.129Z%22%7D%2C%7B%22source_id%22%3A%22Z2NwLXVzLWNlbnRyYWwxOjAxSkdKRVg1SzkyVjZaQ1NSUFFUODlaRktH%22%2C%22checkout_session_identifier%22%3A%223d38706b112d0404cbc5d6abfc8f3cd7%22%2C%22source_type_abbrev%22%3A%22cn%22%2C%22updated_at%22%3A%222025-01-06T08%3A26%3A33.897Z%22%7D%5D%7D; preview_theme=1; _orig_referrer=https%3A%2F%2Fb2b-accelerator.myshopify.com%2Fsearch%3Fq%3DMulti%26storeName%3Db2b-accelerator.myshopify.com%26options%5Bprefix%5D%3Dlast; _landing_page=%2Fcart; _shopify_s=3ad0e4d2-d0aa-45f1-ab75-6429efb28f81; _shopify_essential=:AZO6WuLYAAH_4ca8tNkH8Y6-wdxZ-XXKxZwv25hALWw2tep-nZ0PcAMB_ZVw2qLG-FudE1wBiuahHzAAqCyuBNA7rSuTJZJvNLVxcoxNNdJWwNEOnbFuYNQdl0doMGPIrqbVJkamH-3li6vC2uWUAHdrtrF5r5jjQI8WCoXAjwbWA-o0A0VjmSJblOY5B5bewLiH9V8HfSDm6DF8Rwi7owGBkXDtvVzObvvxtWR8hVxb6UHtG__kvIpc_ia0:; secure_customer_sig=f2003833e952c27295cdb2a300cd7e88; _shopify_sa_p=; cart_sig=cc36f242d2d144274dd195b2256de5be; keep_alive=214ef0d4-5c0f-46c0-aaaf-b1708a2d948c; _shopify_sa_t=2025-01-13T07%3A06%3A59.486Z; cart_ts=1736752046',
              );
              // proxyReq.setHeader('sec-fetch-dest', 'empty');
              // proxyReq.setHeader('sec-fetch-mode', 'cors');
              // proxyReq.setHeader('sec-fetch-user', '?1');
              proxyReq.setHeader("upgrade-insecure-requests", "1");
              proxyReq.setHeader(
                "user-agent",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
              );

              const url = new URL(req.url, "http://localhost");
              if (!url.searchParams.has("callback")) {
                url.searchParams.append("callback", "callback");
              }
              proxyReq.path = url.pathname + url.search;

              console.log("Sending Request:", req.method, proxyReq.path);
            });

            proxy.on("proxyRes", (proxyRes, req, res) => {
              console.log("Received Response:", proxyRes.statusCode, req.url);
            });

            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
          },
        },
      },
    }),
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: false,
        v3_singleFetch: false,
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
    yaml(),
  ],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Use absolute URL for assets
        assetFileNames: (assetInfo) => {
          const info = assetInfo?.name?.split(".");
          const ext = info?.[info.length - 1];
          // Use the full app URL from environment or default
          return `assets/[name]-[hash].${ext}`;
        },
        chunkFileNames: (chunkInfo) => {
          return `assets/[name]-[hash].js`;
        },
        entryFileNames: (chunkInfo) => {
          return `assets/[name]-[hash].js`;
        },
      },
    },
  },
  assetsInclude: ["**/*.svg"],
}) satisfies UserConfig;
