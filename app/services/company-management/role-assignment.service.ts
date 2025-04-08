import { ShopifyClientManager } from '~/lib/shopify/client';
import { GET_CONTACT_ROLES } from '~/lib/shopify/queries/company';
import { COMPANY_LOCATION_ASSIGN_ROLES, REVOKE_COMPANY_CONTACT_ROLE } from '~/lib/shopify/mutation';
import { loggerService } from '~/lib/logger';
import { contactRoleAssignmentRepository } from '~/repositories/company-management/contact-role-assignment.repository';
import { ROLE_NAME_MAPPING, ADMIN_ROLE_NAMES, type RoleAssignmentRequest, type RoleAssignment } from '~/types/company-management/role-assignment.schema';
import { GET_COMPANY_CONTACT_PROFILES } from '~/lib/shopify/queries/company-contact';

export class RoleAssignmentService {
  /**
   * Get role from database
   */
  private async getRole(roleId: string): Promise<any> {
    return contactRoleAssignmentRepository.getRoleById(roleId);
  }

  /**
   * Get Shopify role ID for a given location and role name
   */
  private async getShopifyRoleId(companyLocationId: string, roleName: string, storeName: string): Promise<string> {
    try {
      const response = await ShopifyClientManager.query(
        GET_CONTACT_ROLES,
        storeName,
        {
          variables: { id: companyLocationId }
        }
      );

      const roles = response.data?.companyLocation?.company?.contactRoles?.nodes;
      if (!roles) {
        throw new Error(`No roles found for location ${companyLocationId}`);
      }

      const role = roles.find((r: { name: string }) => r.name === roleName);
      if (!role) {
        throw new Error(`Role ${roleName} not found in Shopify for location ${companyLocationId}`);
      }

      return role.id;
    } catch (error) {
      loggerService.error('Failed to get Shopify role ID', {
        error,
        companyLocationId,
        roleName
      });
      throw error;
    }
  }

  /**
   * Batch process role assignments
   */
  public async assignRole(params: RoleAssignmentRequest): Promise<void> {
    const start = Date.now();
    
    try {
      loggerService.info('Starting role assignment process', { 
        customerId: params.customerId,
        companyId: params.data.companyId,
        assignmentsCount: params.data.roleAssignments.length
      });

      const existingAssignments = await contactRoleAssignmentRepository.findAllByContactAndCompany(
        params.data.companyContactId,
        params.data.companyId,
        params.storeName
      );

      loggerService.info('Existing assignments found', {
        count: existingAssignments.length,
        assignments: existingAssignments.map(a => ({
          locationId: a.companyLocationId,
          roleId: a.roleId
        }))
      });

      const uniqueRoleIds = [...new Set(params.data.roleAssignments.map(a => a.roleId))];
      loggerService.info('Unique role IDs', { uniqueRoleIds });

      const roles = await Promise.all(uniqueRoleIds.map(id => this.getRole(id)));
      loggerService.info('Roles fetched', {
        roles: roles.map(r => ({
          id: r.id,
          name: r.name
        }))
      });
      const roleMap = new Map(roles.map(role => [role.id, role]));

      // If roleAssignments is empty, delete all existing assignments
      if (!params.data.roleAssignments || params.data.roleAssignments.length === 0) {
        loggerService.info('Removing all role assignments', {
          existingCount: existingAssignments.length
        });

        if (existingAssignments.length > 0) {
          await Promise.all(
            existingAssignments.map(assignment =>
              this.handleDeleteAssignment(
                params.data.companyContactId,
                assignment,
                params.storeName
              )
            )
          );
        }

        loggerService.info('All role assignments removed successfully', {
          totalDuration: Date.now() - start
        });
        return;
      }

      // Process assignments in batches
      const batchSize = 10;
      const batches = this.chunkArray(params.data.roleAssignments, batchSize);
      
      // Track processed locations to avoid duplicate processing
      const processedLocations = new Set<string>();

      for (const batch of batches) {
        const relevantExistingAssignments = existingAssignments.filter(existing => {
          const locationId = existing.companyLocationId || existing.companyId;
          const isRelevant = batch.some(a => 
            (a.companyLocationId || a.companyId) === locationId
          ) || !processedLocations.has(locationId);

          if (isRelevant) {
            processedLocations.add(locationId);
          }
          return isRelevant;
        });

        await Promise.all([
          this.processBatchAssignments(params, batch, relevantExistingAssignments, roleMap)
        ]);
      }

      loggerService.info('Role assignments completed successfully', {
        totalDuration: Date.now() - start,
        totalAssignments: params.data.roleAssignments.length
      });
    } catch (error) {
      loggerService.error('Failed to assign roles', { 
        error,
        customerId: params.customerId,
        duration: Date.now() - start
      });
      throw error;
    }
  }

  /**
   * Process a batch of role assignments
   */
  private async processBatchAssignments(
    params: RoleAssignmentRequest,
    assignments: RoleAssignment[],
    existingAssignments: any[],
    roleMap: Map<string, any>
  ): Promise<void> {
    const existingMap = new Map(
      existingAssignments.map(assignment => [
        assignment.companyLocationId || assignment.companyId,
        assignment
      ])
    );

    loggerService.info('Starting batch processing', {
      batchAssignments: assignments.map(a => ({
        locationId: a.companyLocationId,
        roleId: a.roleId
      })),
      existingAssignments: Array.from(existingMap.entries()).map(([key, value]) => ({
        locationId: key,
        roleId: value.roleId
      }))
    });

    const updates: Promise<void>[] = [];
    const creates: Promise<void>[] = [];
    const deletes: Promise<void>[] = [];

    // Get all location IDs from the complete request
    const allRequestLocationIds = new Set(params.data.roleAssignments.map(a => a.companyLocationId || a.companyId));

    // First, identify and execute deletions before any other operations
    for (const [key, existing] of existingMap) {
      // Only delete if the location is not in the complete request
      if (!allRequestLocationIds.has(key)) {
        loggerService.info('Assignment will be deleted', {
          locationId: existing.companyLocationId,
          roleId: existing.roleId,
          reason: 'Location not found in complete request'
        });
        deletes.push(this.handleDeleteAssignment(
          params.data.companyContactId,
          existing,
          params.storeName
        ));
      }
    }

    // Execute all deletions first and wait for them to complete
    if (deletes.length > 0) {
      loggerService.info('Executing delete operations', {
        count: deletes.length
      });
      try {
        await Promise.all(deletes);
        loggerService.info('Delete operations completed successfully');
      } catch (error) {
        loggerService.error('Failed to complete delete operations', { error });
        throw error;
      }
    }

    // Then process updates and creates
    for (const assignment of assignments) {
      const key = assignment.companyLocationId || assignment.companyId;
      const existing = existingMap.get(key);
      const role = roleMap.get(assignment.roleId);

      // Skip processing if this location had a failed deletion
      if (!allRequestLocationIds.has(key)) {
        loggerService.info('Skipping assignment for location with pending deletion', {
          locationId: key,
          roleId: assignment.roleId
        });
        continue;
      }

      loggerService.info('Processing assignment', {
        locationId: key,
        roleId: assignment.roleId,
        hasExisting: !!existing,
        existingDetails: existing ? {
          locationId: existing.companyLocationId,
          roleId: existing.roleId
        } : null,
        hasRole: !!role,
        roleDetails: role ? {
          id: role.id,
          name: role.name
        } : null
      });

      if (!role) {
        loggerService.error('Role not found', { roleId: assignment.roleId });
        continue;
      }

      if (existing) {
        if (existing.roleId !== assignment.roleId) {
          loggerService.info('Assignment will be updated', {
            locationId: assignment.companyLocationId,
            oldRoleId: existing.roleId,
            newRoleId: assignment.roleId
          });
          updates.push(this.handleUpdateAssignment(params, assignment, existing, role));
        } else {
          loggerService.info('Assignment unchanged', {
            locationId: assignment.companyLocationId,
            roleId: assignment.roleId
          });
        }
      } else {
        loggerService.info('New assignment will be created', {
          locationId: assignment.companyLocationId,
          roleId: assignment.roleId
        });
        creates.push(this.handleNewAssignment(params, assignment, role));
      }
    }

    // Execute remaining operations
    const remainingOps = [...updates, ...creates];
    if (remainingOps.length > 0) {
      loggerService.info('Executing remaining operations', {
        updates: updates.length,
        creates: creates.length
      });
      await Promise.all(remainingOps);
    }
  }

  /**
   * Split array into chunks for batch processing
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get company contact ID for a customer
   */
  private async getCompanyContactId(customerId: string, companyId: string, storeName: string): Promise<string | null> {
    try {
      loggerService.info('Fetching company contact ID', { customerId, companyId });

      const response = await ShopifyClientManager.query(
        GET_COMPANY_CONTACT_PROFILES,
        storeName,
        {
          variables: {
            id: customerId
          }
        }
      );

      const contactProfiles = response.data?.customer?.companyContactProfiles;
      if (!contactProfiles || contactProfiles.length === 0) {
        loggerService.warn('No company contact profiles found', { customerId });
        return null;
      }

      loggerService.info('Company contact ID found', { 
        contactId: contactProfiles[0].id,
        customerId
      });

      return contactProfiles[0].id;
    } catch (error) {
      loggerService.error('Failed to get company contact ID', { error, customerId, companyId });
      throw error;
    }
  }

  /**
   * Handle new role assignment with retry and timeout
   */
  private async handleNewAssignment(params: RoleAssignmentRequest, assignment: RoleAssignment, role: any): Promise<void> {
    const maxRetries = 3;
    const baseDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Check if it's a company-level admin role (roleId = 1)
        if (assignment.roleId === '1' && !assignment.companyLocationId) {
          // For company-level admin, we only need to create a database record
          await contactRoleAssignmentRepository.assignRoleToUser({
            storeName: params.storeName,
            customerId: params.customerId,
            data: {
              companyId: params.data.companyId,
              companyLocationId: '',
              companyContactId: params.data.companyContactId,
              roleId: assignment.roleId,
              companyContactRoleAssignmentId: undefined
            }
          });
          return;
        }

        // Ensure companyLocationId exists for location roles
        if (!assignment.companyLocationId) {
          throw new Error('Company location ID is required for location roles');
        }

        // At this point, TypeScript knows companyLocationId is not undefined
        const companyLocationId: string = assignment.companyLocationId;

        // For location-level roles, proceed with Shopify API call
        const shopifyRoleId = await this.getShopifyRoleId(
          companyLocationId,
          ROLE_NAME_MAPPING[role.name as keyof typeof ROLE_NAME_MAPPING],
          params.storeName
        );

        loggerService.info('Assigning new role in Shopify', {
          locationId: companyLocationId,
          roleId: shopifyRoleId,
          attempt
        });

        const response = await ShopifyClientManager.mutation(
          COMPANY_LOCATION_ASSIGN_ROLES,
          params.storeName,
          {
            variables: {
              companyLocationId,
              rolesToAssign: [{
                companyContactId: params.data.companyContactId,
                companyContactRoleId: shopifyRoleId
              }]
            }
          }
        );

        if (response.data?.companyLocationAssignRoles?.userErrors?.length > 0) {
          const error = response.data.companyLocationAssignRoles.userErrors[0];
          loggerService.error('Shopify role assignment failed', { error });
          throw new Error(error.message);
        }

        const roleAssignmentId = response.data.companyLocationAssignRoles.roleAssignments[0].id;
        
        await contactRoleAssignmentRepository.assignRoleToUser({
          storeName: params.storeName,
          customerId: params.customerId,
          data: {
            companyId: params.data.companyId,
            companyLocationId,
            companyContactId: params.data.companyContactId,
            roleId: assignment.roleId,
            companyContactRoleAssignmentId: roleAssignmentId
          }
        });
        
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000) + Math.random() * 1000;
        loggerService.warn(`Retrying role assignment after error (attempt ${attempt})`, { error });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Handle deletion of role assignment
   */
  private async handleDeleteAssignment(
    companyContactId: string,
    assignment: any,
    storeName: string
  ): Promise<void> {
    try {
      loggerService.info('Starting role assignment deletion', { assignment });

      if (assignment.companyContactRoleAssignmentId) {
        loggerService.info('Revoking role in Shopify', {
          companyContactId,
          roleAssignmentId: assignment.companyContactRoleAssignmentId
        });

        const response = await ShopifyClientManager.mutation(
          REVOKE_COMPANY_CONTACT_ROLE,
          storeName,
          {
            variables: {
              companyContactId: companyContactId,
              companyContactRoleAssignmentId: assignment.companyContactRoleAssignmentId
            }
          }   
        );

        loggerService.info('Shopify role revocation response', { response });
        if (response.errors?.message === 'GraphQL Client: fetch failed') {
          loggerService.error('Shopify API unavailable', { 
            error: response,
            assignmentId: assignment.id
          });
          return;
        }
        console.log(3333);
        if (response.data?.revokeCompanyContactRole?.userErrors?.length > 0) {
          const error = response.data.revokeCompanyContactRole.userErrors[0];
          loggerService.error('Shopify role revocation failed', { error });
          return;
        }

        loggerService.info('Role successfully revoked in Shopify', { response });
      }

      loggerService.info('Deleting role assignment record', { assignmentId: assignment.id });
      await contactRoleAssignmentRepository.deleteRoleAssignment(assignment.id);
      loggerService.info('Role assignment successfully deleted', { assignmentId: assignment.id });

    } catch (error) {
      console.log(error);
      loggerService.error('Error in role deletion', {
        error,
        assignmentId: assignment.id,
        companyContactId
      });
      throw error;
    }
  }

  /**
   * Handle update role assignment
   */
  private async handleUpdateAssignment(
    params: RoleAssignmentRequest,
    assignment: RoleAssignment,
    existingAssignment: any,
    role: any
  ): Promise<void> {
    try {
      // For company-level admin role (roleId = 1), only update database
      if (assignment.roleId === '1' && !assignment.companyLocationId) {
        await contactRoleAssignmentRepository.updateRoleAssignment(
          existingAssignment.id,
          params.storeName,
          params.data.companyId,
          '',
          params.data.companyContactId,
          assignment.roleId,
          params.customerId
        );
        return;
      }

      // Ensure companyLocationId exists for location roles
      if (!assignment.companyLocationId) {
        throw new Error('Company location ID is required for location roles');
      }

      // At this point, TypeScript knows companyLocationId is not undefined
      const companyLocationId: string = assignment.companyLocationId;
      const needsShopifyUpdate = this.needsShopifyUpdate(existingAssignment.roleId, assignment.roleId);

      if (needsShopifyUpdate) {
        // Revoke existing role
        if (existingAssignment.companyContactRoleAssignmentId) {
          const revokeResponse = await ShopifyClientManager.mutation(
            REVOKE_COMPANY_CONTACT_ROLE,
            params.storeName,
            {
              variables: {
                companyContactId: params.data.companyContactId,
                companyContactRoleAssignmentId: existingAssignment.companyContactRoleAssignmentId
              }
            }
          );

        
          
          if (revokeResponse.errors?.message === 'GraphQL Client: fetch failed') {
            loggerService.error('Shopify API unavailable during revoke', { 
              error: revokeResponse,
              assignmentId: existingAssignment.id
            });
            return;
          }

          if (revokeResponse.data?.revokeCompanyContactRole?.userErrors?.length > 0) {
            const error = revokeResponse.data.revokeCompanyContactRole.userErrors[0];
            loggerService.error('Shopify role revocation failed', { error });
            return;
          }
        }

        // Assign new role
        const shopifyRoleId = await this.getShopifyRoleId(
          companyLocationId,
          ROLE_NAME_MAPPING[role.name as keyof typeof ROLE_NAME_MAPPING],
          params.storeName
        );

        const response = await ShopifyClientManager.mutation(
          COMPANY_LOCATION_ASSIGN_ROLES,
          params.storeName,
          {
            variables: {
              companyLocationId,
              rolesToAssign: [{
                companyContactId: params.data.companyContactId,
                companyContactRoleId: shopifyRoleId
              }]
            }
          }
        );


        if (response.errors?.message === 'GraphQL Client: fetch failed') {
          loggerService.error('Shopify API unavailable during assign', { 
            error: response,
            assignmentId: existingAssignment.id
          });
          return;
        }

        if (response.data?.companyLocationAssignRoles?.userErrors?.length > 0) {
          const error = response.data.companyLocationAssignRoles.userErrors[0];
          loggerService.error('Shopify role update failed', { error });
          return;
        }

        const roleAssignmentId = response.data.companyLocationAssignRoles.roleAssignments[0].id;

        await contactRoleAssignmentRepository.updateRoleAssignment(
          existingAssignment.id,
          params.storeName,
          params.data.companyId,
          companyLocationId,
          params.data.companyContactId,
          assignment.roleId,
          params.customerId,
          roleAssignmentId
        );
      } else {
        await contactRoleAssignmentRepository.updateRoleAssignment(
          existingAssignment.id,
          params.storeName,
          params.data.companyId,
          companyLocationId,
          params.data.companyContactId,
          assignment.roleId,
          params.customerId
        );
      }

    } catch (error) {
      loggerService.error('Error in role update', {
        error,
        assignmentId: existingAssignment.id
      });
      throw error;
    }
  }

  /**
   * Check if role update requires Shopify API call
   */
  private needsShopifyUpdate(currentRoleName: string, newRoleName: string): boolean {
    const isCurrentAdmin = ADMIN_ROLE_NAMES.includes(currentRoleName);
    const isNewAdmin = ADMIN_ROLE_NAMES.includes(newRoleName);
    return isCurrentAdmin || isNewAdmin;
  }
}

export const roleAssignmentService = new RoleAssignmentService(); 