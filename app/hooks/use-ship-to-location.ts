import { useQuery } from "@tanstack/react-query";
import { QUERY_SHIP_TO_LOCATION_LIST } from "~/constant/react-query-keys";
import { getShipToLocations } from "~/request/ship-to-location";
import type { CompanyLocationParams } from "~/types/ship-to-location";

export function useShipToLocationList(params: CompanyLocationParams, isEnabled: boolean = true) {
    const queryResult = useQuery({
      queryKey: [QUERY_SHIP_TO_LOCATION_LIST,params],
      queryFn: async () => {
        return await getShipToLocations(params);
      },
      enabled: isEnabled
    });
    return queryResult;
  }