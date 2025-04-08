import _ from "lodash";
import { PoParserResponse } from "~/types/purchase-order/po-parser.schema";

export const flatParseResultsLocationOptions = (
  data: PoParserResponse["data"],
) => {
  //   return res.data?.companyContactProfiles.map((profile) => ({
  //     label: profile.name,
  //     value: profile.id,
  //   }));
  const { companyContactProfiles } = data;

  if (!companyContactProfiles) return [];

  const flatRes = _.flatMap(companyContactProfiles, (profile) => {
    return (profile?.company?.locations || []).map((location) => ({
      label: location.name,
      value: location.id,
      metaData: {
        companyContactId: profile.id,
        companyId: profile.company.id,
        companyLocationId: location.id,
      },
    }));
  });

  return flatRes;
};
