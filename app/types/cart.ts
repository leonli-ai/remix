interface CartLine {
  merchandiseId: string;
  quantity: number;
}

type CartLineWithLineId = CartLine & { lineId?: string };

interface CartInput {
  lines: CartLine[];
  buyerIdentity?: {
    email: string;
    // customerAccessToken?: string; // The access token used to identify the customer associated with the cart.
  };
}

interface CartAddLinesInput {
  cartId: string;
  lines: CartLine[];
}

export type { CartInput, CartAddLinesInput, CartLineWithLineId };
