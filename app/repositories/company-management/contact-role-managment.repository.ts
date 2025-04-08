import prisma from '../../db.server';
import { loggerService } from "~/lib/logger";
import type { ContactRole, ContactRoleResponse } from "~/types/company-management/contact-role.schema";

export class ContactRoleManagmentRepository {

  /**
   * Retrieves all available roles from the system
   * @returns Array of roles with their details
   * @throws When database query fails
   */
  async getAllRoles(): Promise<ContactRoleResponse> {
    try {
      const roles = await prisma.rDSCompanyContactRole.findMany({
        select: {
          id: true,
          name: true,
          note: true
        }
      });
      const rolesWithNonNullNotes = roles.map(role => ({
        ...role,
        note: role.note ?? ''
      }));
      return { roles: rolesWithNonNullNotes };
    } catch (error) {
      loggerService.error('Failed to fetch roles', error);
      throw error;
    }
  }


  async getByName(name: string): Promise<ContactRole> {
    try {
      const role = await prisma.rDSCompanyContactRole.findFirst({
        where: { name: name },
        select: {
          id: true,
          name: true,
          note: true
        }
      });
      if (!role) {
        throw new Error(`Role with name ${name} not found`);
      }
      return {
        id: role.id,
        name: role.name,
        note: role.note ?? ''
      };
    } catch (error) {
      loggerService.error('Failed to fetch role by name', { name, error });
      throw error;
    }
  }


  /**
   * Retrieves a role by its ID from the system
   * @param id - The ID of the role to retrieve
   * @returns The role with its details if found, otherwise throws an error
   * @throws When database query fails or role with the given ID not found
   */
  async getById(id: string): Promise<ContactRole> {
    try {
      const role = await prisma.rDSCompanyContactRole.findUnique({
        where: { id: id },
        select: {
          id: true,
          name: true,
          note: true
        }
      });
      if (!role) {
        throw new Error(`Role with ID ${id} not found`);
      }
      return {
        id: role.id,
        name: role.name,
        note: role.note ?? ''
      };
    } catch (error) {
      loggerService.error('Failed to fetch role by ID', { id, error });
      throw error;
    }
  }

  /**
   * Check if a user has approval permission based on their role
   * @param storeName Store name
   * @param companyLocationId Company location ID
   * @param companyContactId Company contact ID of the approver
   * @returns Boolean indicating if the user has approval permission
   */
  public async hasApprovalPermission(
    storeName: string,
    companyLocationId: string,
    companyContactId: string
  ): Promise<boolean> {
    try {
      loggerService.info('Checking approval permission', {
        storeName,
        companyLocationId,
        companyContactId
      });
      
      // Check if the approver has the required role (roleId 1 or 3)
      const roleAssignment = await prisma.rDSCompanyRoleAssignment.findFirst({
        where: {
          storeName,
          companyLocationId,
          companyContactId,
          roleId: {
            in: ['1', '3'] // Role IDs stored as strings in the database
          }
        }
      });

      return !!roleAssignment;
    } catch (error) {
      loggerService.error('Error checking approval permission', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error,
        storeName,
        companyLocationId,
        companyContactId
      });

      throw error;
    }
  }
}

export const contactRoleManagmentRepository = new ContactRoleManagmentRepository();
