import { ShopifyClientManager } from '~/lib/shopify/client';
import { GET_CUSTOMER_DETAILS } from '~/lib/shopify/queries';
import { loggerService } from '~/lib/logger';
import { contactRoleAssignmentRepository } from '~/repositories/company-management/contact-role-assignment.repository';
import { 
  type CustomerDetailsRequest, 
  type CustomerDetailsResponse,
  type LocationBasedRole,
  type CompanyWideRole,
  type ShopifyRoleAssignment
} from '~/types/customer-management/customer-details.schema';

export class CustomerService {
  public async getCustomerDetails(params: CustomerDetailsRequest): Promise<CustomerDetailsResponse> {
    try {
      loggerService.info('Fetching customer details from Shopify', { 
        customerId: params.customerId,
        storeName: params.storeName 
      });

      const response = await ShopifyClientManager.query(
        GET_CUSTOMER_DETAILS,
        params.storeName,
        {
          variables: {
            customerId: params.customerId
          }
        }
      );
      
    
      loggerService.info('Received customer details from Shopify', { response });

      if (!response.data?.customer) {
        loggerService.warn('Customer not found in Shopify', { customerId: params.customerId });
        throw new Error('Customer not found');
      }

      const customer = response.data.customer;
      const companyContactProfile = customer.companyContactProfiles?.[0];

      if (!companyContactProfile) {
        loggerService.warn('No company contact profile found', { customerId: params.customerId });
        throw new Error('User has no assigned roles. Please contact admin for role assignment.');
      }

      // Get Shopify role assignments
      const shopifyRoleAssignments = companyContactProfile.roleAssignments?.edges || [];
      
      if (shopifyRoleAssignments.length === 0) {
        loggerService.warn('No roles found in Shopify', { customerId: params.customerId });
        throw new Error('User has no assigned roles. Please contact admin for role assignment.');
      }

      // Get DB role assignments
      let dbRoleAssignments = await contactRoleAssignmentRepository.findAllByContactAndCompanyWithRole(
        companyContactProfile.id,
        companyContactProfile.company.id,
        params.storeName
      );
      loggerService.info('DB role assignments', { dbRoleAssignments }); 

      // Compare and sync if needed
      try {
        if (dbRoleAssignments.length === 0) {
          await this.syncRoleAssignments(
            shopifyRoleAssignments,
            params.customerId,
            params.storeName,
            companyContactProfile.id,
            companyContactProfile.company.id
          );
        } else {
          const dbRoleIds = new Set(dbRoleAssignments.map(r => r.companyContactRoleAssignmentId));
          const missingAssignments = shopifyRoleAssignments.filter(
            (edge: any) => !dbRoleIds.has(edge.node.id)
          );

          if (missingAssignments.length > 0) {
            await this.syncRoleAssignments(
              missingAssignments,
              params.customerId,
              params.storeName,
              companyContactProfile.id,
              companyContactProfile.company.id
            );
          }
        }
      } catch (syncError) {
        loggerService.warn('Role sync failed but continuing with existing roles', {
          error: syncError,
          customerId: params.customerId
        });
      }

      // Fetch final role assignments
      dbRoleAssignments = await contactRoleAssignmentRepository.findAllByContactAndCompanyWithRole(
        companyContactProfile.id,
        companyContactProfile.company.id,
        params.storeName
      );

      // Format and return response
      const formattedResponse = {
        customer: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          state: customer.state,
          companyId: companyContactProfile.company.id,
          companyContactId: companyContactProfile.id
        },
        company: {
          id: companyContactProfile.company.id,
          name: companyContactProfile.company.name
        },
        roles: dbRoleAssignments.map(assignment => {
          const baseRole = {
            id: assignment.roleId,
            name: assignment.role.name
          };

          // Find matching Shopify role assignment to get location name
          const shopifyAssignment = shopifyRoleAssignments.find(
            (edge: ShopifyRoleAssignment) => edge.node.id === assignment.companyContactRoleAssignmentId
          );

          return assignment.companyLocationId ? 
            { 
              ...baseRole, 
              companyLocationId: assignment.companyLocationId,
              companyLocationName: shopifyAssignment?.node.companyLocation?.name
            } as LocationBasedRole :
            { ...baseRole, companyId: companyContactProfile.company.id } as CompanyWideRole;
        })
      };

      loggerService.info('Successfully retrieved customer details', {
        customerId: params.customerId,
        rolesCount: formattedResponse.roles.length
      });

      return formattedResponse;

    } catch (error) {
      console.log(error);
      loggerService.error('Failed to fetch customer details', { 
        error,
        customerId: params.customerId,
        storeName: params.storeName
      });
      throw error;
    }
  }

  private async syncRoleAssignments(
    roleAssignments: ShopifyRoleAssignment[],
    customerId: string,
    storeName: string,
    companyContactId: string,
    companyId: string
  ): Promise<void> {
    try {
      // 1. Get existing role assignments from database
      const existingAssignments = await contactRoleAssignmentRepository.findAllByContactAndCompanyWithRole(
        companyContactId,
        companyId,
        storeName
      );

      // 2. Create a function to generate unique assignment key
      const getAssignmentKey = (assignment: {
        companyId: string;
        storeName: string;
        companyLocationId: string | null;
        companyContactId: string;
      }): string => {
        return `${assignment.companyId}-${assignment.storeName}-${assignment.companyLocationId || 'null'}-${assignment.companyContactId}`;
      };

      // 3. Create a map of existing assignments for quick lookup
      const existingAssignmentsMap = new Map(
        existingAssignments.map(assignment => [
          getAssignmentKey(assignment),
          assignment
        ])
      );

      // 4. Transform and filter new role assignments
      const transformedRoles = roleAssignments.map(edge => ({
        companyContactId,
        companyId,
        storeName,
        roleId: edge.node.role.name.toLowerCase().includes('admin') ? '1' : '2',
        companyLocationId: edge.node.companyLocation?.id || null,
        companyContactRoleAssignmentId: edge.node.id,
        createdBy: customerId,
        updatedBy: customerId
      }));

      const newAssignments = transformedRoles.filter(
        role => !existingAssignmentsMap.has(getAssignmentKey(role))
      );

      // 5. Create new role assignments if any exist
      if (newAssignments.length > 0) {
        loggerService.info('Creating new role assignments', {
          count: newAssignments.length
        });

        await contactRoleAssignmentRepository.bulkCreateWithSkipDuplicates(newAssignments);
      }

      loggerService.info('Role assignments sync completed', {
        total: roleAssignments.length,
        new: newAssignments.length
      });
    } catch (error) {
      loggerService.error('Error in syncRoleAssignments', {
        error,
        customerId,
        storeName,
        companyContactId
      });
      // Continue processing without throwing error
    }
  }
}

export const customerService = new CustomerService(); 