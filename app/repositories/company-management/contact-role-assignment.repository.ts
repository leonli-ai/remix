import prisma from '../../db.server';
import { loggerService } from "~/lib/logger";
import type { SingleRoleAssignmentRequest } from "~/types/company-management/role-assignment.schema";

export class ContactRoleAssignmentRepository {
  async assignRoleToUser(params: SingleRoleAssignmentRequest) {
    try {
      loggerService.info('Attempting to assign role to user', { 
        storeName: params.storeName,
        companyId: params.data.companyId,
        companyContactId: params.data.companyContactId,
        roleId: params.data.roleId 
      });
      
      const result = await prisma.rDSCompanyRoleAssignment.create({
        data: {
          storeName: params.storeName,
          companyId: params.data.companyId,
          companyLocationId: params.data.companyLocationId,
          companyContactId: params.data.companyContactId,
          roleId: params.data.roleId,
          companyContactRoleAssignmentId: params.data.companyContactRoleAssignmentId,
          createdBy: params.customerId,
          updatedBy: params.customerId
        }
      });
      
      loggerService.info('Successfully assigned role to user', { 
        id: result.id,
        roleId: result.roleId 
      });
      
      return result;
    } catch (error) {
      loggerService.error('Failed to assign role to user', { 
        error,
        params 
      });
      throw error;
    }
  }

  /**
   * Find role assignment by contact and location
   */
  public async findByCustomerAndLocation(
    companyContactId: string,
    companyLocationId: string,
    companyId: string,
    storeName: string
  ) {
    return prisma.rDSCompanyRoleAssignment.findFirst({
      where: {
        companyContactId,
        companyLocationId,
        companyId,
        storeName
      }
    });
  }

  /**
   * Delete role assignments by customer, location and company
   */
  public async deleteByCustomerAndLocation(
    companyLocationId: string,
    companyId: string,
    storeName: string
  ) {
    return prisma.rDSCompanyRoleAssignment.deleteMany({
      where: {
        companyLocationId,
        companyId,
        storeName
      }
    });
  }

  /**
   * Update role assignment
   */
  public async updateRoleAssignment(
    roleId: string,
    storeName: string,
    companyId: string,
    companyLocationId: string,
    companyContactId: string,
    newRoleId: string,
    customerId: string,
    companyContactRoleAssignmentId?: string,
  ) {
    try {
      loggerService.info('Attempting to update role assignment', {
        roleId,
        newRoleId,
        companyId,
        companyContactId
      });

      const result = await prisma.rDSCompanyRoleAssignment.update({
        where: {
          companyId_storeName_companyLocationId_companyContactId: {
            companyId,
            storeName,
            companyLocationId,
            companyContactId
          }
        },
        data: {
          roleId: newRoleId,
          companyContactRoleAssignmentId,
          updatedBy: customerId,
          updatedAt: new Date()
        }
      });

      loggerService.info('Successfully updated role assignment', {
        id: result.id,
        newRoleId: result.roleId
      });

      return result;
    } catch (error) {
      loggerService.error('Failed to update role assignment', {
        error,
        roleId,
        newRoleId,
        companyId,
        companyContactId
      });
      throw error;
    }
  }

  /**
   * Get role by ID
   */
  public async getRoleById(roleId: string) {
    return prisma.rDSCompanyContactRole.findUnique({
      where: { id: roleId }
    });
  }

  /**
   * Find all role assignments for a contact
   */
  public async findAllByContact(
    companyContactId: string,
    companyId: string,
    storeName: string
  ) {
    return prisma.rDSCompanyRoleAssignment.findMany({
      where: {
        companyContactId,
        companyId,
        storeName
      }
    });
  }

  public async findAllByContactAndCompany(
    companyContactId: string,
    companyId: string,
    storeName: string
  ) {
    return prisma.rDSCompanyRoleAssignment.findMany({
      where: {
        companyContactId,
        companyId,
        storeName
      }
    });
  }

  public async deleteAllByContactAndCompany(
    companyContactId: string,
    companyId: string,
    storeName: string
  ) {
    try {
      loggerService.info('Attempting to delete all role assignments', {
        companyContactId,
        companyId,
        storeName
      });

      const result = await prisma.rDSCompanyRoleAssignment.deleteMany({
        where: {
          companyContactId,
          companyId,
          storeName
        }
      });

      loggerService.info('Successfully deleted role assignments', {
        count: result.count
      });

      return result;
    } catch (error) {
      loggerService.error('Failed to delete role assignments', {
        error,
        companyContactId,
        companyId
      });
      throw error;
    }
  }

  public async deleteRoleAssignment(id: string) {
    return prisma.rDSCompanyRoleAssignment.delete({
      where: { id }
    });
  }

  /**
   * Find all role assignments with role information
   */
  public async findAllByContactAndCompanyWithRole(
    companyContactId: string,
    companyId: string,
    storeName: string
  ) {
    return prisma.rDSCompanyRoleAssignment.findMany({
      where: {
        companyContactId,
        companyId,
        storeName
      },
      include: {
        role: true
      }
    });
  }

  public async bulkCreate(assignments: Array<{
    companyContactId: string;
    companyId: string;
    storeName: string;
    roleId: string;
    companyLocationId?: string;
    companyContactRoleAssignmentId: string;
    createdBy: string;
    updatedBy: string;
  }>) {
    try {
      loggerService.info('Attempting bulk role assignment creation', {
        count: assignments.length
      });

      const result = await prisma.rDSCompanyRoleAssignment.createMany({
        data: assignments
      });

      loggerService.info('Successfully created bulk role assignments', {
        count: result.count
      });

      return result;
    } catch (error) {
      loggerService.error('Failed to create bulk role assignments', {
        error,
        assignmentsCount: assignments.length
      });
      throw error;
    }
  }

  async bulkCreateWithSkipDuplicates(assignments: any[]) {
    return prisma.rDSCompanyRoleAssignment.createMany({
      data: assignments,
      skipDuplicates: true
    });
  }
}

export const contactRoleAssignmentRepository = new ContactRoleAssignmentRepository();
