import { globalFetch } from "~/lib/fetch";

export async function getCartAjax() {
  try {
    const response = await globalFetch(`/cart.js`, {
      method: "GET",
      type: "ajax",
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function addToCartAjax(
  items: {
    id: number;
    quantity: number;
  }[],
) {
  try {
    const response = await globalFetch("/cart/add.js", {
      method: "POST",
      type: "ajax",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
      }),
    });

    return response;
  } catch (error) {
    throw error;
  }
}
