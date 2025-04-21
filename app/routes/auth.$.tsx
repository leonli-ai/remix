import { type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("/auth.$.tsx:loader");
  try {
    const {redirect} = await authenticate.admin(request);
    return redirect('/');
  } catch (error) {
    console.log(error)
  }
  return null
};
