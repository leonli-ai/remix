import { type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("/auth.$.tsx:loader");
  try {
    const {redirect} = await authenticate.admin(request);
    return redirect('/');
  } catch (error) {
    const mes = await error.text()
    console.error("Error authenticating admin", error, mes);
  }
  return null
};
