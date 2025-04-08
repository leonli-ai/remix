import { globalFetch } from "~/lib/fetch";
import type { CompanyLocationParams, CompanyLocationResponse } from "~/types/ship-to-location";

export const getShipToLocations = async (params: CompanyLocationParams) => {
    const response = await globalFetch("/company-management/company-location/fetch-all", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response as CompanyLocationResponse;
  };