import { useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { UserInfo } from "./UserInfo";
import { CompanyLocationList } from "../CompanyLocationList";
import { useUserDetails } from "~/hooks/use-users";
import { useMemo } from "react";
import type { UserDetailsParams } from "~/types/users";
import { useShopifyInformation } from "~/lib/shopify";
import { Loading } from "~/components/common/GlobalLoading";
import { useTranslation } from "react-i18next";
import {useAddLocalePath} from '~/hooks/utils.hooks';

export const UserDetails = () => {
  const navigate = useNavigate();
  const {addLocalePath} = useAddLocalePath()
  const { storeName, shopifyCompanyId } = useShopifyInformation();
  const [searchParams] = useSearchParams();
  const { id: companyContactId = "" } = useParams();
  const customerId = searchParams.get("customerId") ?? "";
  const isEdit = searchParams.get("isEdit");
  const { t } = useTranslation();
  const params: UserDetailsParams = useMemo(() => {
    return {
      companyContactId: companyContactId || "",
      customerId: customerId || "",
      companyId: shopifyCompanyId || "",
      storeName: storeName || "",
    };
  }, [companyContactId, customerId, shopifyCompanyId, storeName]);

  const { data: userDetails, isLoading, isRefetching } = useUserDetails(params);

  const customerData = useMemo(() => {
    return {
      firstName: userDetails?.customer?.firstName,
      lastName: userDetails?.customer?.lastName,
      email: userDetails?.customer?.email,
      accountStatus: userDetails?.customer?.state,
      isMainContact: userDetails?.isMainContact,
      company: userDetails?.company?.name,
    };
  }, [userDetails]);

  const locationList = useMemo(() => {
    return (
      userDetails?.roles
        .map((role) => ({
          ...role.companyLocation,
          role: role.name,
          roleId: role.id,
        }))
        .filter((location) => !!location.id) || []
    );
  }, [userDetails]);

  if (!userDetails || isLoading || isRefetching) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-8">
        {t("user.details.title")} - {customerData.firstName}{" "}
        {customerData.lastName}
      </h1>

      {/* Back Button */}
      <div
        onClick={() =>
          navigate(addLocalePath("/apps/customer-account/company-management/customer"))
        }
        className="inline-flex items-center text-sm mb-6 cursor-pointer text-outline"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t("user.details.back-to-user-list")}
      </div>

      {/* Account Info Section */}
      <UserInfo customerData={customerData} />

      {/* User Company Location Section */}
      {(locationList.length > 0 || isEdit) && (
        <CompanyLocationList
          isEdit={!!isEdit}
          customerId={customerId}
          companyContactId={companyContactId}
          locationList={locationList}
          userDetails={userDetails}
        />
      )}
    </div>
  );
};
