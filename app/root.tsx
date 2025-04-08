import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster as SonnerToaster } from "sonner";
import circleCheck from "~/assets/icons/circle_check.svg";
import closeLight from "~/assets/icons/close_light.svg";

import { Toaster } from "./components/ui/toaster";
import "./tailwind.css";
import i18n from "./lib/i18n";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { LOCALSTORAGE_LANGUAGE_KEY } from "./constant/common";

function formatPathToTitle(path: string): string {
  const segments = path.split("/").filter(Boolean);
  let lastMeaningfulSegment = segments[segments.length - 1];

  if (/^\d+$/.test(lastMeaningfulSegment)) {
    lastMeaningfulSegment = segments[segments.length - 2];
  }

  return lastMeaningfulSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = request.headers;
  const proxyPrefix = headers.get("X-Shopify-Proxy-Prefix");
  console.log("proxyPrefix===", proxyPrefix);
  console.log("header===", headers);
  console.log("request===", request);
  return json({ proxyPrefix });
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  // initialize the language of i18n and listen to the storage change
  useEffect(() => {
    const language = localStorage.getItem(LOCALSTORAGE_LANGUAGE_KEY);
    if (language) {
      i18n.changeLanguage(language);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCALSTORAGE_LANGUAGE_KEY) {
        const newLanguage = event.newValue;
        if (newLanguage) {
          i18n.changeLanguage(newLanguage);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const location = useLocation();
  const isLocal = import.meta.env.MODE === "development";

  useEffect(() => {
    try {
      if (
        location.pathname.startsWith("/apps/customer-account") &&
        !location.pathname.includes("test")
      ) {
        const pathTitle = formatPathToTitle(location.pathname);
        const titleElement = document.querySelector("title");

        if (titleElement) {
          const currentTitle = titleElement.textContent || "";
          const titleParts = currentTitle.split("–").map((part) => part.trim());
          titleParts[0] = pathTitle;
          const newTitle = titleParts.join(" – ");
          document.title = newTitle;
        }
      }
    } catch (error) {
      console.error("Error formatting path to title:", error);
    }
  }, [location.pathname]);

  if (
    location.pathname.startsWith("/apps/customer-account") &&
    !location.pathname.includes("test") &&
    !isLocal
  ) {
    return (
      <>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link rel="preconnect" href="https://cdn.shopify.com/" />
          <link
            rel="stylesheet"
            href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
          />
          <Meta />
          <Links />
        </head>
        <div id="RemixAppContent">
          <Toaster />
          <SonnerToaster
            richColors
            className="toaster group"
            position="top-center"
            expand={true}
            toastOptions={{
              classNames: {
                closeButton:
                  "left-[94%] top-[45%] border-none text-gray-900 !bg-transparent",
                content: "pr-7",
                toast:
                  "shadow-[0_1px_4px_0_rgba(0,0,0,0.18)] p-3 gap-3 !bg-[#D6F7F8] rounded-sm border-none",
                title: "text-primary-text text-sm font-normal",
              },
            }}
            closeButton
            icons={{
              close: <img src={closeLight} alt="close" className="h-3 w-3.5" />,
              success: (
                <img src={circleCheck} alt="circle check" className="h-6 w-6" />
              ),
            }}
          />
          <QueryClientProvider client={queryClient}>
            <Outlet />
          </QueryClientProvider>
          <ScrollRestoration />
          <Scripts />
        </div>
      </>
    );
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />

        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />

        <Meta />
        <Links />
      </head>
      <body>
        <Toaster />
        <SonnerToaster
          richColors
          className="toaster group"
          position="top-center"
          expand={true}
          toastOptions={{
            classNames: {
              closeButton:
                "left-[94%] top-[45%] border-none text-gray-900 !bg-transparent",
              content: "pr-7",
              toast:
                "shadow-[0_1px_4px_0_rgba(0,0,0,0.18)] p-3 gap-3 !bg-[#D6F7F8] rounded-sm border-none",
              title: "text-primary-text text-sm font-normal",
            },
          }}
          closeButton
          icons={{
            close: <img src={closeLight} alt="close" className="h-3 w-3.5" />,
            success: (
              <img src={circleCheck} alt="circle check" className="h-6 w-6" />
            ),
          }}
        />
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
