import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  const remixContent = document.getElementById("RemixAppContent");
  const mainContent = document.getElementById("MainContent");

  if (remixContent && mainContent) {
    if (!remixContent.hasAttribute('data-hydrated')) {
      try {
        hydrateRoot(
          remixContent,
          <StrictMode>
            <RemixBrowser />
          </StrictMode>
        );
        remixContent.setAttribute('data-hydrated', 'true');
      } catch (error) {
        console.error('Hydration failed:', error);
      }
    }
  } else {
    hydrateRoot(
      document,
      <StrictMode>
      <RemixBrowser />
    </StrictMode>
    );
  }
});