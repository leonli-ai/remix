import { globalFetch } from "~/lib/fetch";
import type { ShopSettingsRequest } from "~/types/shop/shop-settings.schema";

export const fetchShopSettings = async (params: ShopSettingsRequest) => {
  const response = await globalFetch(`/shop/settings-general/fetch-all`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response;
};
