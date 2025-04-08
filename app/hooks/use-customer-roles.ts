import { useState, useCallback } from 'react';
import { globalFetch } from '~/lib/fetch';

interface Role {
  id: string;
  name: string;
  note: string;
}


interface LocationPermission {
  roleId: string;
  isChecked: boolean;
}

interface RoleAssignment {
  companyId?: string;
  companyLocationId?: string;
  roleId: string;
}

interface FetchRolesResponse {
  roles: Array<{
    id: string;
    name: string;
    note: string;
  }>;
}

interface CustomerDetailsSuccessResponse {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    state: string;
    companyId: string;
    companyContactId: string;
  };
  company: {
    id: string;
    name: string;
  };
  roles: Array<{
    id: string;
    name: string;
    companyId?: string;
    companyLocationId?: string;
  }>;
}

interface CustomerDetailsErrorResponse {
  code: 403;
  message: string;
}

type CustomerDetailsResponse = CustomerDetailsSuccessResponse | CustomerDetailsErrorResponse;

interface RoleAssignResponse {
  success: boolean;
  message?: string;
}

export function useCustomerRoles(shop: string) {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [locationPermissions, setLocationPermissions] = useState<Record<string, Record<string, LocationPermission>>>({});
  const [companyPermissions, setCompanyPermissions] = useState<Record<string, LocationPermission>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoles = useCallback(async (customerId: string) => {
    setIsLoading(true);
    try {
      const response = await globalFetch('/company-management/contact-role-management/fetch-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeName: shop,
          customerId,
        }),
      });

      const data = (typeof response === 'string' ? JSON.parse(response) : response) as FetchRolesResponse;
      if (data.roles && Array.isArray(data.roles)) {
        setAvailableRoles(data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [shop]);

  const fetchCustomerDetails = useCallback(async (customerId: string) => {
    setIsLoading(true);
    try {
      const response = await globalFetch('/customer-management/customer/get-by-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeName: shop,
          customerId,
        }),
      });

      const data = (typeof response === 'string' ? JSON.parse(response) : response) as CustomerDetailsResponse;

      if ('code' in data && data.code === 403) {
        setLocationPermissions({});
        setCompanyPermissions({});
      } else if ('customer' in data) {
        const newLocationPermissions: Record<string, Record<string, LocationPermission>> = {};
        const newCompanyPermissions: Record<string, LocationPermission> = {};

        data.roles.forEach(role => {
          if (role.companyLocationId) {
            if (!newLocationPermissions[role.companyLocationId]) {
              newLocationPermissions[role.companyLocationId] = {};
            }
            newLocationPermissions[role.companyLocationId][role.id] = {
              roleId: role.id,
              isChecked: true
            };
          } else if (role.companyId) {
            newCompanyPermissions[role.id] = {
              roleId: role.id,
              isChecked: true
            };
          }
        });

        setLocationPermissions(newLocationPermissions);
        setCompanyPermissions(newCompanyPermissions);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [shop]);

  const assignRoles = useCallback(async (
    customerId: string,
    companyId: string,
    companyContactId: string,
    roleAssignments: RoleAssignment[]
  ) => {
    try {
      const response = await globalFetch('/company-management/contact-role-management/role-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept-language': '',
        },
        body: JSON.stringify({
          storeName: shop,
          customerId,
          data: {
            companyId,
            companyContactId,
            roleAssignments
          }
        }),
      });

      const data = (typeof response === 'string' ? JSON.parse(response) : response) as RoleAssignResponse;
      return data;
    } catch (error) {
      console.error('Error assigning roles:', error);
      throw error;
    }
  }, [shop]);

  return {
    availableRoles,
    locationPermissions,
    companyPermissions,
    fetchRoles,
    fetchCustomerDetails,
    assignRoles,
    setLocationPermissions,
    setCompanyPermissions,
    isLoading,
  };
} 