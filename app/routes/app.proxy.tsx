import { type LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
// import { cors } from "remix-utils/cors";

export const action = async ({ request }: LoaderFunctionArgs) => {
  console.log("/app.proxy");
  const { session, admin } = await authenticate.public.appProxy(request);

  if (session) {
    console.log("session", session);
  }

  const response = await admin!.graphql(
    `#graphql
    query {
      products(first: 1) {
        nodes {
          id
          title
        }
      }
    }`
  );

  const responseJson = await response.json();

  console.log("data", responseJson.data);

  return responseJson;
};

const Proxy = () => {
  return <Page>Proxy</Page>
}

export default Proxy
