import { cn } from "~/lib/utils";

import type { CompanyLocationItem } from "~/types/ship-to-location";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { UserDetailsResponse } from "~/types/users";
import { useTranslation } from "react-i18next";
interface CompanyLocationCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  companyLocationItem: CompanyLocationItem;
  isEdit?: boolean;
  isSelected?: boolean;
  onCheckedChange?: (value: boolean, id: string) => void;
  onRoleChange?: (value: string) => void;
  roles?: UserDetailsResponse["roles"];
  isCreate?: boolean;
  currentRole?: string;
}

export default function CompanyLocationCard({
  companyLocationItem,
  className,
  isEdit = false,
  isSelected = false,
  onCheckedChange,
  onRoleChange,
  roles,
  isCreate = false,
  currentRole,
}: CompanyLocationCardProps) {
  const { t } = useTranslation();
  const { name, shippingAddress, role } = companyLocationItem;
  const { address1, address2, city, province, zip, country } = shippingAddress;

  return (
    <div className="flex items-start gap-2 mt-4">
      <div
        className={cn(
          "bg-blue-50 rounded-lg p-4 shadow-sm w-full flex gap-2",
          className,
        )}
      >
        {(isEdit || isCreate) && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value: boolean) => {
              onCheckedChange?.(value, companyLocationItem.id);
            }}
          />
        )}
        <div className="grid grid-cols-2 gap-x-2 gap-y-4 w-full">
          <div>
            <div className="text-gray-900 text-sm font-bold">
              {t("company-location.list.table.account-name")}
            </div>
            <div className="text-gray-900">{name}</div>
          </div>
          <div>
            <div className="text-gray-900 text-sm font-bold">
              {t("company-location.list.table.company-address")}
            </div>
            <div className=" text-gray-900">{`${address1 ? address1 : ""} ${address2 ? address2 : ""}`}</div>
          </div>

          <div>
            <div className="text-gray-900 text-sm font-bold">
              {t("company-location.list.table.city")}
            </div>
            <div className=" text-gray-900">{city}</div>
          </div>

          <div>
            <div className="text-gray-900 text-sm font-bold">
              {t("company-location.list.table.state")}
            </div>
            <div className="text-gray-900">{province}</div>
          </div>

          <div>
            <div className="text-gray-900 text-sm font-bold">
              {t("company-location.list.table.zip")}
            </div>
            <div className="text-gray-900">{zip}</div>
          </div>

          <div>
            <div className="text-gray-900 text-sm font-bold">
              {t("company-location.list.table.country")}
            </div>
            <div className="text-gray-900">{country}</div>
          </div>

          {!!role && !isEdit && (
            <div>
              <div className="text-gray-900 text-sm font-bold">
                {t("company-location.list.table.role")}
              </div>
              <div className="text-gray-900">{role}</div>
            </div>
          )}
          {(isEdit || isCreate) && (
            <div className="mt-4 col-span-2">
              <div className="text-gray-900 text-sm font-bold">
                {t("company-location.list.table.role")}
              </div>
              <Select value={currentRole} onValueChange={onRoleChange}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("company-location.list.table.select-role")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
