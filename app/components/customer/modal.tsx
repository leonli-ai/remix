import {
  Modal,
  Button,
  Form,
  Checkbox,
  Select,
  Spinner,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import type { Customer } from "~/hooks/use-customers";
import { useCompanyLocations } from "~/hooks/use-customers";
import { useCustomerRoles } from "~/hooks/use-customer-roles";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
  shop: string;
}

export function CustomModal({
  open,
  onClose,
  customer,
  shop,
}: CustomModalProps) {
  const { t } = useTranslation();
  const {
    locations,
    isLoading: locationsLoading,
    fetchLocations,
    hasNextPage,
    loadMore,
  } = useCompanyLocations();
  const {
    availableRoles,
    locationPermissions,
    companyPermissions,
    fetchRoles,
    fetchCustomerDetails,
    assignRoles,
    setLocationPermissions,
    setCompanyPermissions,
    isLoading: rolesLoading,
  } = useCustomerRoles(shop);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  console.log("availableRoles", availableRoles);
  console.log("locations", locations);
  console.log("locationPermissions", locationPermissions);

  useEffect(() => {
    if (!open) {
      setSelectedCompanyId("");
      setLocationPermissions({});
      setCompanyPermissions({});
    }
  }, [open, setLocationPermissions, setCompanyPermissions]);

  useEffect(() => {
    if (open && customer?.id) {
      fetchRoles(customer.id);
      fetchCustomerDetails(customer.id);
    }
  }, [open, customer, fetchRoles, fetchCustomerDetails]);

  useEffect(() => {
    if (open && customer?.companyContactProfiles?.[0]?.company?.id) {
      const companyId = customer.companyContactProfiles[0].company.id;
      setSelectedCompanyId(companyId);
      fetchLocations(companyId);
    }
  }, [open, customer, fetchLocations]);

  const handleCompanyChange = useCallback(
    (value: string) => {
      setSelectedCompanyId(value);
      setLocationPermissions({});
      fetchLocations(value);
    },
    [fetchLocations],
  );

  const handlePermissionChange = useCallback(
    (locationId: string, roleId: string) => {
      setLocationPermissions((prev) => ({
        ...prev,
        [locationId]: {
          ...Object.keys(prev[locationId] || {}).reduce(
            (acc, currentRoleId) => ({
              ...acc,
              [currentRoleId]: {
                roleId: currentRoleId,
                isChecked: false,
              },
            }),
            {},
          ),
          [roleId]: {
            roleId,
            isChecked: !prev[locationId]?.[roleId]?.isChecked,
          },
        },
      }));
    },
    [setLocationPermissions],
  );

  const handleCompanyPermissionChange = useCallback(
    (roleId: string) => {
      setCompanyPermissions((prev) => ({
        ...Object.keys(prev).reduce(
          (acc, currentRoleId) => ({
            ...acc,
            [currentRoleId]: {
              roleId: currentRoleId,
              isChecked: false,
            },
          }),
          {},
        ),
        [roleId]: {
          roleId,
          isChecked: !prev[roleId]?.isChecked,
        },
      }));
    },
    [setCompanyPermissions],
  );

  const handleSubmit = useCallback(async () => {
    if (!customer?.id || !customer.companyContactProfiles?.[0]?.company?.id)
      return;

    const companyId = customer.companyContactProfiles[0].company.id;
    const companyContactId = customer.companyContactProfiles[0].id;

    const roleAssignments = [
      // Company roles
      ...Object.entries(companyPermissions)
        .filter(([_, permission]) => permission.isChecked)
        .map(([_, permission]) => ({
          companyId,
          roleId: permission.roleId,
        })),
      // Location roles
      ...Object.entries(locationPermissions).flatMap(([locationId, roles]) =>
        Object.entries(roles)
          .filter(([_, permission]) => permission.isChecked)
          .map(([_, permission]) => ({
            companyLocationId: locationId,
            roleId: permission.roleId,
          })),
      ),
    ];

    try {
      await assignRoles(
        customer.id,
        companyId,
        companyContactId,
        roleAssignments,
      );
      toast.success(
        t("admin-portal.company-role-management.modal.change-role-success"),
        {
          description: t(
            "admin-portal.company-role-management.modal.change-role-success-description",
          ),
        },
      );
      onClose();
    } catch (error) {
      console.error("Error assigning roles:", error);
      toast.error(
        t("admin-portal.company-role-management.modal.change-role-failed"),
        {
          description: t(
            "admin-portal.company-role-management.modal.change-role-failed-description",
          ),
        },
      );
    }
  }, [
    customer,
    locationPermissions,
    companyPermissions,
    assignRoles,
    onClose,
    toast,
  ]);

  const isModalLoading = locationsLoading || rolesLoading;

  const companyOptions =
    customer?.companyContactProfiles?.map((profile) => ({
      label: profile.company.name,
      value: profile.company.id,
    })) || [];

  return (
    <Modal
      open={open}
      title={t("admin-portal.company-role-management.modal.title")}
      onClose={onClose}
      loading={isModalLoading}
    >
      <Form onSubmit={handleSubmit}>
        <div className="p-6">
          <div className="mb-3">
            <p className="text-gray-600">
              <b>{t("admin-portal.company-role-management.modal.username")}:</b>{" "}
              {customer?.displayName || "-"}
            </p>
          </div>

          {companyOptions.length > 0 ? (
            <>
              <div className="flex items-end gap-4 mb-4">
                <div className="flex-1">
                  <Select
                    label={t(
                      "admin-portal.company-role-management.modal.company",
                    )}
                    options={companyOptions}
                    value={selectedCompanyId}
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {availableRoles
                    .filter((role) => role.name === "Admin")
                    .map((role) => (
                      <Checkbox
                        key={role.id}
                        label={role.name}
                        checked={
                          companyPermissions[role.id]?.isChecked || false
                        }
                        onChange={() => handleCompanyPermissionChange(role.id)}
                      />
                    ))}
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {locationsLoading && locations.length === 0 ? (
                  <div className="flex justify-center items-center py-8">
                    <Spinner
                      accessibilityLabel="Loading locations"
                      size="large"
                    />
                  </div>
                ) : locations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {t(
                      "admin-portal.company-role-management.modal.no-locations-found",
                    )}
                  </div>
                ) : (
                  <>
                    <ul className="space-y-4">
                      {locations.map((location) => (
                        <li
                          key={location.id}
                          className="border-b pb-4 last:border-0"
                        >
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {location.name}
                            </span>
                            <div className="flex gap-2 ml-4">
                              {availableRoles.map((role) => (
                                <Checkbox
                                  key={role.id}
                                  label={role.name}
                                  checked={
                                    locationPermissions[location.id]?.[role.id]
                                      ?.isChecked || false
                                  }
                                  onChange={() =>
                                    handlePermissionChange(location.id, role.id)
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {hasNextPage && (
                      <div className="flex justify-center mt-4">
                        <Button
                          onClick={() => loadMore(selectedCompanyId)}
                          disabled={locationsLoading}
                          size="slim"
                        >
                          {locationsLoading
                            ? t(
                                "admin-portal.company-role-management.modal.loading",
                              )
                            : t(
                                "admin-portal.company-role-management.modal.load-more",
                              )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t(
                "admin-portal.company-role-management.modal.no-company-associated",
              )}
            </div>
          )}

          <div className="flex justify-center gap-2 mt-6">
            <Button submit variant="primary" disabled={!companyOptions.length}>
              {t("admin-portal.company-role-management.modal.confirm")}
            </Button>
            <Button onClick={onClose}>
              {t("admin-portal.company-role-management.modal.cancel")}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
