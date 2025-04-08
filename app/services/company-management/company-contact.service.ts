import type { CompanyContactRequest, CompanyContactResponse } from '../../types/company-management/company-contact.schema';
import { ShopifyClientManager } from '~/lib/shopify/client';
import { 
  GET_FILTERED_COMPANY_CONTACTS,
  GET_COMPANY_CONTACT_DETAIL,
  GET_COMPANY_LOCATION_SHIPPING_ADDRESS,
  GET_COMPANY_LOCATIONS,
  GET_CONTACT_ROLES,
  GET_CUSTOMER_BY_EMAIL
} from '~/lib/shopify/queries';
import { loggerService } from '~/lib/logger';
import { CompanyContactError, CompanyContactErrorCodes } from '~/lib/errors/company-contact-errors';
import type { DeleteCompanyContactRequest, DeleteCompanyContactResponse } from '../../types/company-management/company-contact-delete.schema';
import { REVOKE_COMPANY_CONTACT_ROLE, DELETE_COMPANY_CONTACT } from '~/lib/shopify/mutation/company-contact';
import { ContactRoleAssignmentRepository, contactRoleAssignmentRepository } from '../../repositories/company-management/contact-role-assignment.repository';
import { ContactRoleManagmentRepository } from '~/repositories/company-management/contact-role-managment.repository';
import type { ContactDetailRequest, ContactDetailResponse } from '~/types/company-management/company-contact-get-by-id.schema';
import { CompanyLocationError, CompanyLocationErrorCodes } from '~/lib/errors/company-location-errors';
import type { CompanyLocationRequest, CompanyLocationResponse } from '~/types/company-management/company-location.schema';
import { RoleError, RoleErrorCodes } from '~/lib/errors/role-errors';
import type {  ContactRoleRequest, ContactRoleResponse } from '~/types/company-management/contact-role.schema';
import { UserCreationError } from '~/lib/errors/user-errors';
import { CREATE_CUSTOMER, COMPANY_ASSIGN_CUSTOMER_AS_CONTACT, COMPANY_LOCATION_ASSIGN_ROLES } from '~/lib/shopify/mutation';
import type { CreateUserRequest, UserDetailResponse } from '~/types/company-management/user.schema';

export class CompanyContactService {
  private cursors: Map<number, string> = new Map();

  private readonly contactRoleRepository: ContactRoleManagmentRepository;
  private readonly contactRoleAssignmentRepository: ContactRoleAssignmentRepository;


  constructor() {
    this.contactRoleRepository = new ContactRoleManagmentRepository();
    this.contactRoleAssignmentRepository = new ContactRoleAssignmentRepository();
  }
  

  /**
   * Fetch company contacts with pagination and filtering
   */
  public async fetchContacts(params: CompanyContactRequest): Promise<CompanyContactResponse> {
    try {
     
      loggerService.info('Fetching company contacts', { 
        companyId: params.companyId,
        pagination: params.pagination
      });

      let first = params.pagination?.first;
      if(!params.pagination?.first&& !params.pagination?.last) {
        first = 10;
      }


      const response = await ShopifyClientManager.query(
        GET_FILTERED_COMPANY_CONTACTS,
        params.storeName,
        {
          variables: {
            companyId: params.companyId,
            first: first,
            after: params.pagination?.after,
            last: params.pagination?.last,
            before: params.pagination?.before,
            query: params.pagination?.query
          }
        }
      );


      if (!response.data?.company?.contacts) {
        throw new CompanyContactError(
          'Failed to fetch company contacts',
          CompanyContactErrorCodes.FETCH_FAILED
        );
      }

      const { contactsCount } = response.data.company;
      const { edges, pageInfo } = response.data.company.contacts;

    
      return {
        companyContacts: edges.map((edge: any) => ({
          id: edge.node.id,
          customer: {
            id: edge.node.customer.id,
            email: edge.node.customer.email,
            firstName: edge.node.customer.firstName,
            lastName: edge.node.customer.lastName,
            state: edge.node.customer.state
          },
          isMainContact: edge.node.isMainContact
        })),
        pagination: {
          hasNextPage: pageInfo.hasNextPage,
          hasPreviousPage: pageInfo.hasPreviousPage,
          startCursor: pageInfo.startCursor,
          endCursor: pageInfo.endCursor,
          totalCount: contactsCount.count
        }
      };
    } catch (error) {
      loggerService.error('Failed to fetch company contacts', { error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error });
      throw error;
    }
  }

    /**
   * Fetch company locations with pagination
   */
    public async fetchLocations(params: CompanyLocationRequest): Promise<CompanyLocationResponse> {
      try {
        loggerService.info('Fetching company locations', { 
          companyId: params.companyId,
          pagination: params.pagination
        });
        let first = params.pagination?.first;
        if(!params.pagination?.first&& !params.pagination?.last) {
          first = 10;
        }
  

        const response = await ShopifyClientManager.query(
          GET_COMPANY_LOCATIONS,
          params.storeName,
          {
            variables: {
              companyId: params.companyId,
              first: first,
              after: params.pagination?.after,
              last: params.pagination?.last,
              before: params.pagination?.before,
              query: params.pagination?.query
            }
          }
        );

        if (!response.data?.company?.locations) {
          throw new CompanyLocationError(
            'Failed to fetch company locations',
            CompanyLocationErrorCodes.FETCH_FAILED
          );
        }

        const { edges, pageInfo } = response.data.company.locations;
        const { locationsCount } = response.data.company;

        return {
          companyLocations: edges.map((edge: any) => ({
            id: edge.node.id,
            name: edge.node.name,
            buyerExperienceConfiguration: edge.node.buyerExperienceConfiguration ? {
              paymentTermsTemplate: edge.node.buyerExperienceConfiguration.paymentTermsTemplate ? {
                description: edge.node.buyerExperienceConfiguration.paymentTermsTemplate.description,
                dueInDays: edge.node.buyerExperienceConfiguration.paymentTermsTemplate.dueInDays,
                id: edge.node.buyerExperienceConfiguration.paymentTermsTemplate.id,
                name: edge.node.buyerExperienceConfiguration.paymentTermsTemplate.name,
                paymentTermsType: edge.node.buyerExperienceConfiguration.paymentTermsTemplate.paymentTermsType,
                translatedName: edge.node.buyerExperienceConfiguration.paymentTermsTemplate.translatedName
              } : undefined
            } : undefined,
            shippingAddress: edge.node.shippingAddress ? {
              firstName: edge.node.shippingAddress.firstName,
              lastName: edge.node.shippingAddress.lastName,
              address1: edge.node.shippingAddress.address1,
              address2: edge.node.shippingAddress.address2,
              city: edge.node.shippingAddress.city,
              companyName: edge.node.shippingAddress.companyName,
              country: edge.node.shippingAddress.country,
              countryCode: edge.node.shippingAddress.countryCode,
              province: edge.node.shippingAddress.province,
              zip: edge.node.shippingAddress.zip,
              recipient: edge.node.shippingAddress.recipient,
              zoneCode: edge.node.shippingAddress.zoneCode,
              phone: edge.node.shippingAddress.phone
            } : undefined,
            billingAddress: edge.node.billingAddress ? {
              firstName: edge.node.billingAddress.firstName,
              lastName: edge.node.billingAddress.lastName,
              address1: edge.node.billingAddress.address1,
              address2: edge.node.billingAddress.address2,
              city: edge.node.billingAddress.city,
              companyName: edge.node.billingAddress.companyName,
              country: edge.node.billingAddress.country,
              countryCode: edge.node.billingAddress.countryCode,
              province: edge.node.billingAddress.province,
              zip: edge.node.billingAddress.zip,
              recipient: edge.node.billingAddress.recipient,
              zoneCode: edge.node.billingAddress.zoneCode,
              phone: edge.node.billingAddress.phone
            } : undefined
          })),
          pagination: {
            hasNextPage: pageInfo.hasNextPage,
            hasPreviousPage: pageInfo.hasPreviousPage,
            startCursor: pageInfo.startCursor,
            endCursor: pageInfo.endCursor,
            totalCount: locationsCount.count
          }
        };
      } catch (error) {
        loggerService.error('Failed to fetch company locations', {
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : error,
          companyId: params.companyId
        });
        throw error;
      }
    }
  

  /**
   * Clear stored cursors
   */
  public clearCursors(): void {
    this.cursors.clear();
  }


  /**
   * Delete company contact and associated roles
   */
  public async deleteContact(params: DeleteCompanyContactRequest): Promise<DeleteCompanyContactResponse> {
    try {
      loggerService.info('Starting contact deletion process', { 
        companyContactId: params.data.companyContactId,
        companyId: params.data.companyId
      });

      // Find all role assignments for this contact
      const roleAssignments = await contactRoleAssignmentRepository.findAllByContactAndCompany(
        params.data.companyContactId,
        params.data.companyId,
        params.storeName
      );

      if (!roleAssignments || roleAssignments.length === 0) {
        loggerService.error('Role assignments not found', { 
          companyContactId: params.data.companyContactId,
          companyId: params.data.companyId
        });
        throw new CompanyContactError(
          'Role assignments not found',
          CompanyContactErrorCodes.CONTACT_NOT_FOUND
        );
      }

      // Process each role assignment
      for (const assignment of roleAssignments) {
        if (assignment.companyContactRoleAssignmentId) {
          // Revoke role in Shopify
          await this.revokeContactRole(
            assignment.companyContactId,
            assignment.companyContactRoleAssignmentId,
            params.storeName
          );
        }
      }

      // Delete company contact in Shopify
      await this.deleteCompanyContact(params.data.companyContactId, params.storeName);

      // Delete all role assignments in RDS
      await contactRoleAssignmentRepository.deleteAllByContactAndCompany(
        params.data.companyContactId,
        params.data.companyId,
        params.storeName
      );

      return {
        success: true,
        message: 'Company contact deleted successfully'
      };

    } catch (error) {
      loggerService.error('Failed to delete contact', { 
        error,
        companyContactId: params.data.companyContactId,
        companyId: params.data.companyId
      });
      throw error;
    }
  }

  /**
   * Revoke company contact role
   */
  private async revokeContactRole(companyContactId: string, roleAssignmentId: string, storeName: string) {
    const response = await ShopifyClientManager.mutation(
      REVOKE_COMPANY_CONTACT_ROLE,
      storeName,
      {
        variables: {
          companyContactId,
          companyContactRoleAssignmentId: roleAssignmentId
        }
      }
    );

    if (response.data?.companyContactRevokeRole?.userErrors?.length > 0) {
      throw new CompanyContactError(
        response.data.companyContactRevokeRole.userErrors[0].message,
        CompanyContactErrorCodes.FETCH_FAILED
      );
    }
  }

  /**
   * Delete company contact
   */
  private async deleteCompanyContact(companyContactId: string, storeName: string) {
    const response = await ShopifyClientManager.mutation(
      DELETE_COMPANY_CONTACT,
      storeName,
      {
        variables: { companyContactId }
      }
    );

    if (response.data?.companyContactDelete?.userErrors?.length > 0) {
      throw new CompanyContactError(
        response.data.companyContactDelete.userErrors[0].message,
        CompanyContactErrorCodes.FETCH_FAILED
      );
    }
  }

  /**
   * Get company contact detail with roles and locations
   */
  public async getContactDetail(params: ContactDetailRequest): Promise<ContactDetailResponse> {
    try {
      // Step 1: Get company contact details and role assignments in parallel
      const [contactResponse, roleAssignments] = await Promise.all([
        ShopifyClientManager.query(
          GET_COMPANY_CONTACT_DETAIL,
          params.storeName,
          {
            variables: { id: params.companyContactId }
          }
        ),
        contactRoleAssignmentRepository.findAllByContact(
          params.companyContactId,
          params.companyId,
          params.storeName
        )
      ]);

      if (!contactResponse.data?.companyContact) {
        throw new CompanyContactError(
          'Company contact not found',
          CompanyContactErrorCodes.CONTACT_NOT_FOUND
        );
      }

      const contact = contactResponse.data.companyContact;
      
      // Step 2: Get role details and location information in parallel
      const rolePromises = roleAssignments.map(async (assignment) => {
        const [role, locationResponse] = await Promise.all([
          contactRoleAssignmentRepository.getRoleById(assignment.roleId),
          assignment.companyLocationId ? 
            ShopifyClientManager.query(
              GET_COMPANY_LOCATION_SHIPPING_ADDRESS,
              params.storeName,
              {
                variables: { companyLocationId: assignment.companyLocationId }
              }
            ) : 
            Promise.resolve({ data: { companyLocation: null } })
        ]);

        const location = locationResponse.data?.companyLocation;

        return {
          id: role?.id,
          name: role?.name,
          companyLocation: location ? {
            id: location.id,
            name: location.name,
            shippingAddress: location.shippingAddress || {}
          } : null
        };
      });

      const rolesWithLocations = await Promise.all(rolePromises);

      // Step 3: Combine all information
      return {
        id: contact.id,
        customer: {
          id: contact.customer.id,
          email: contact.customer.email,
          firstName: contact.customer.firstName,
          lastName: contact.customer.lastName,
          state: contact.customer.state
        },
        company: {
          id: contact.company.id,
          name: contact.company.name
        },
        isMainContact: contact.isMainContact,
        roles: rolesWithLocations.filter(role => role !== null) as Array<{ id: string; name: string; companyLocation: { id: string; name: string; shippingAddress: { address1?: string | undefined; address2?: string | undefined; city?: string | undefined; province?: string | undefined; zip?: string | undefined; country?: string | undefined; countryCode?: string | undefined; }; }; }>
      };

    } catch (error) {
      loggerService.error('Failed to get contact detail', { 
        error,
        companyContactId: params.companyContactId,
        companyId: params.companyId
      });
      throw error;
    }
  }

    /**
   * Get all available roles
   */
    public async getRoles(params: ContactRoleRequest): Promise<ContactRoleResponse> {
      try {
        loggerService.info('Fetching all roles', {
          storeName: params.storeName
        });
  
        const roles = await this.contactRoleRepository.getAllRoles();
  
        loggerService.info('Successfully retrieved roles', {
          count: roles.roles.length
        });
  
        return roles;
      } catch (error) {
        // If error is already a RoleError, rethrow it
        if (error instanceof RoleError) {
          throw error;
        }
  
        loggerService.error('Failed to get roles', {
          storeName: params.storeName,
          error
        });
  
        throw new RoleError(
          'Failed to retrieve roles',
          RoleErrorCodes.ROLE_FETCH_ERROR
        );
      }
    }

      /**
   * Finds existing customer by email
   */
  private async findExistingCustomer(email: string, storeName: string) {
    try {
      const response = await ShopifyClientManager.query(GET_CUSTOMER_BY_EMAIL, storeName, {
        variables: { email }
      });

      const customer = response.data?.customers?.edges[0]?.node;
      if (customer) {
        loggerService.info('Existing customer found', { email });
        return customer;
      }
      return null;
    } catch (error) {
      loggerService.error('Failed to find existing customer', { 
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        email,
        storeName 
      });
      throw error;
    }
  }

  /**
   * Gets or creates a customer in Shopify
   */
  private async getOrCreateCustomer(params: CreateUserRequest) {
    // Check if customer already exists
    const existingCustomer = await this.findExistingCustomer(params.data.email, params.storeName);
    if (existingCustomer) {
      loggerService.info('Using existing customer');
      return existingCustomer;
    }

    // Create new customer if doesn't exist
    loggerService.info('Creating new customer');
    return await this.createShopifyCustomer(params);
  }

  /**
   * Creates a new user with company contact and role assignments
   */
  public async createUser(params: CreateUserRequest): Promise<UserDetailResponse> {
    const startTime = Date.now();
    loggerService.info('Starting user creation process');

    try {
      // Step 1: Parallel execution of independent operations
      const [
        customer,                // Create customer
        dbRoles,                // Get roles from database
        existingContactRoles,   // Get contact roles for validation
      ] = await Promise.all([
        this.createShopifyCustomer(params),
        this.preloadDatabaseRoles(params.data.companyLocations || []),
        this.validateLocationRoles(params.storeName, params.data.companyLocations || [])
      ]);

      // Step 2: Create company contact (depends on customer)
      const companyContactId = await this.assignCompanyContact(
        params.companyId,
        customer.id,
        params.storeName
      );

      // Step 3: Process role assignments in parallel batches
      await this.processRoleAssignments({
        params,
        companyContactId,
        customerId: customer.id,
        dbRoles,
        existingContactRoles
      });

      const duration = Date.now() - startTime;
      loggerService.info('User creation completed', { 
        duration,
        customerId: customer.id,
        companyContactId
      });

      return this.formatUserResponse(customer);
    } catch (error) {
      const duration = Date.now() - startTime;
      loggerService.error('Error occurred', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          code: error instanceof UserCreationError ? error.errorCode : undefined,
        } : 'Unknown error',
        duration,
      });
      throw error;
    }
  }

  /**
   * Preload roles from database
   */
  private async preloadDatabaseRoles(companyLocations: Array<{ roleId: string }>) {
    const uniqueRoleIds = [...new Set(companyLocations.map(loc => loc.roleId))];
    const dbRoles = await Promise.all(
      uniqueRoleIds.map(roleId => this.contactRoleRepository.getById(roleId))
    );

    const roles = new Map();
    dbRoles.forEach((role, index) => {
      if (!role) {
        throw new UserCreationError(`Invalid role ID: ${uniqueRoleIds[index]}`, 'INVALID_ROLE_ID');
      }
      roles.set(role.id, role);
    });

    return roles;
  }

  /**
   * Validate location roles
   */
  private async validateLocationRoles(
    storeName: string,
    companyLocations: Array<{ locationId: string }>
  ) {
    const locationRoles = new Map();
    const BATCH_SIZE = 3;
    const batches = [];

    // Prepare batches
    for (let i = 0; i < companyLocations.length; i += BATCH_SIZE) {
      batches.push(companyLocations.slice(i, i + BATCH_SIZE));
    }

    // Process batches in parallel
    for (const batch of batches) {
      const results = await Promise.all(
        batch.map(async ({ locationId }) => {
          try {
            const roles = await this.getShopifyContactRoles(storeName, locationId);
            return { locationId, roles, success: true };
          } catch (error) {
            return { locationId, error, success: false };
          }
        })
      );

      // Handle results
      results.forEach(result => {
        if (result.success) {
          locationRoles.set(result.locationId, result.roles);
        } else {
          throw new UserCreationError(
            `Failed to validate roles for location ${result.locationId}`,
            'CONTACT_ROLES_FETCH_ERROR'
          );
        }
      });
    }

    return locationRoles;
  }

  /**
   * Process role assignments in parallel batches
   */
  private async processRoleAssignments({
    params,
    companyContactId,
    customerId,
    dbRoles,
    existingContactRoles
  }: {
    params: CreateUserRequest;
    companyContactId: string;
    customerId: string;
    dbRoles: Map<string, any>;
    existingContactRoles: Map<string, Array<{ id: string; name: string }>>;
  }) {
    const { companyLocations = [] } = params.data;
    const BATCH_SIZE = 3;
    const batches = [];

    // Prepare batches
    for (let i = 0; i < companyLocations.length; i += BATCH_SIZE) {
      batches.push(companyLocations.slice(i, i + BATCH_SIZE));
    }

    // Process batches sequentially, but assignments within each batch in parallel
    for (const batch of batches) {
      const batchStart = Date.now();
      
      const assignments = await Promise.all(
        batch.map(async location => {
          try {
            const dbRole = dbRoles.get(location.roleId);
            const shopifyRoles = existingContactRoles.get(location.locationId);

            if (!shopifyRoles) {
              throw new UserCreationError(
                `No roles found for location ${location.locationId}`,
                'CONTACT_ROLES_FETCH_ERROR'
              );
            }

            const roleName = dbRole.name.toLowerCase() === 'admin' ? 'Location admin' : 'Ordering only';
            const shopifyRole = shopifyRoles.find(r => r.name === roleName);

            if (!shopifyRole) {
              throw new UserCreationError(
                `Required role "${roleName}" not found for location ${location.locationId}`,
                'COMPANY_LOCATION_ASSIGN_ROLES_ERROR'
              );
            }

            // Assign role and create record in parallel
            await Promise.all([
              this.assignLocationRole(
                location,
                companyContactId,
                shopifyRole.id,
                params.storeName
              ),
              this.createRoleAssignmentRecord(
                params,
                location,
                companyContactId,
                dbRole.id,
                shopifyRole.id,
                customerId
              )
            ]);

            return { success: true, locationId: location.locationId };
          } catch (error) {
            return { 
              success: false, 
              locationId: location.locationId,
              error: error instanceof Error ? error : new Error('Unknown error')
            };
          }
        })
      );

      // Check for failures in this batch
      const failures = assignments.filter(a => !a.success);
      if (failures.length > 0) {
        throw new UserCreationError(
          `Failed to assign roles for locations: ${failures.map(f => 
            `${f.locationId} (${(f as any).error.message})`
          ).join('; ')}`,
          'ROLE_ASSIGNMENT_FAILED'
        );
      }

      const batchDuration = Date.now() - batchStart;
      loggerService.info('Batch processing completed', {
        duration: batchDuration,
        successCount: assignments.length
      });
    }
  }

  /**
   * Gets contact roles for a specific location from Shopify
   */
  private async getShopifyContactRoles(storeName: string, locationId: string): Promise<Array<{ id: string; name: string }>> {
    try {
      loggerService.debug('Fetching contact roles for location', { 
        storeName,
        locationId
      });
      
      const response = await ShopifyClientManager.query(GET_CONTACT_ROLES, storeName, {
        variables: {
          id: locationId
        }
      });

      const roles = response.data?.companyLocation?.company?.contactRoles?.nodes;
      if (!Array.isArray(roles) || roles.length === 0) {
        loggerService.error('No contact roles found for location', {
          responseData: response.data,
          locationId
        });
        throw new UserCreationError(
          `No contact roles available for location ${locationId}`,
          'CONTACT_ROLES_FETCH_ERROR'
        );
      }

      loggerService.debug('Successfully fetched contact roles for location', {
        locationId,
        rolesCount: roles.length,
        roles: roles.map(r => ({ id: r.id, name: r.name }))
      });

      return roles;
    } catch (error) {
      loggerService.error('Failed to fetch contact roles for location', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        storeName,
        locationId
      });
      
      if (error instanceof UserCreationError) {
        throw error;
      }
      
      throw new UserCreationError(
        `Failed to fetch contact roles for location ${locationId}`,
        'CONTACT_ROLES_FETCH_ERROR'
      );
    }
  }

  /**
   * Assigns role to location
   */
  private async assignLocationRole(
    location: {locationId: string; roleId: string},
    companyContactId: string,
    shopifyRoleId: string,
    storeName: string
  ): Promise<string> {
    try {
      const response = await ShopifyClientManager.mutation(
        COMPANY_LOCATION_ASSIGN_ROLES,
        storeName,
        {
          variables: {
            companyLocationId: location.locationId,
            rolesToAssign: [{ 
              companyContactId, 
              companyContactRoleId: shopifyRoleId 
            }]
          }
        }
      );

      if (response.data?.companyLocationAssignRoles?.userErrors?.length > 0) {
        const error = response.data.companyLocationAssignRoles.userErrors[0];
        throw new UserCreationError(
          error.message,
          'COMPANY_LOCATION_ASSIGN_ROLES_ERROR'
        );
      }

      const assignedRoleId = response.data?.companyLocationAssignRoles?.roleAssignments[0]?.id;
      if (!assignedRoleId) {
        throw new UserCreationError(
          'Failed to get assigned role ID from response',
          'COMPANY_LOCATION_ASSIGN_ROLES_ERROR'
        );
      }

      return assignedRoleId;
    } catch (error) {
      loggerService.error('Failed to assign role to location', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        locationId: location.locationId,
        companyContactId
      });
      throw error;
    }
  }

  /**
   * Creates role assignment record
   */
  private async createRoleAssignmentRecord(params: any, location: any, companyContactId: string, roleId: string, assignedRoleId: string, customerId: string) {
    const roleAssignment = {
      storeName: params.storeName,
      customerId,
      data: {
        companyId: params.companyId,
        companyLocationId: location.locationId,
        companyContactId,
        roleId: location.roleId,
        companyContactRoleAssignmentId: assignedRoleId
      }
    };
    loggerService.info('Creating role assignment record', { roleAssignment });

    const response = await this.contactRoleAssignmentRepository.assignRoleToUser(roleAssignment);
    if (!response) {
      throw new Error('Failed to create user role assignment');
    }
  }
  
  /**
   * Validates customer data from response
   */
  private validateCustomerData(customer: any) {
    if (!customer) {
      throw new UserCreationError('Customer data is missing', 'MISSING_CUSTOMER');
    }

    const requiredFields = ['id', 'email', 'firstName', 'lastName', 'state'];
    const missingFields = requiredFields.filter(field => !customer[field]);

    if (missingFields.length > 0) {
      throw new UserCreationError(
        `Missing required customer fields: ${missingFields.join(', ')}`,
        'INVALID_CUSTOMER_DATA'
      );
    }
  }

  /**
   * Formats user response with validation
   */
  private formatUserResponse(customer: any): UserDetailResponse {
    this.validateCustomerData(customer);

    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      accountStatus: customer.state
    };
  }

  /**
   * Creates a new customer in Shopify
   */
  private async createShopifyCustomer(params: CreateUserRequest) {
    try {
      const response = await ShopifyClientManager.mutation(CREATE_CUSTOMER, params.storeName, {
        variables: {
          input: {
            email: params.data.email,
            firstName: params.data.firstName,
            lastName: params.data.lastName
          }
        }
      });

      if (!response?.data?.customerCreate) {
        throw new UserCreationError(
          'Invalid response from customer creation',
          'CUSTOMER_CREATE_ERROR'
        );
      }

      const { customer, userErrors } = response.data.customerCreate;

      if (userErrors?.length > 0) {
        throw new UserCreationError(
          userErrors[0].message,
          'CUSTOMER_CREATE_ERROR'
        );
      }

      if (!customer || !customer.id) {
        throw new UserCreationError(
          'Customer data is missing from response',
          'INVALID_CUSTOMER_DATA'
        );
      }

      loggerService.info('Customer created in Shopify', { customerId: customer.id });
      return customer;
    } catch (error) {
      loggerService.error('Failed to create customer', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Assigns customer as a company contact
   */
  private async assignCompanyContact(companyId: string, customerId: string, storeName: string): Promise<string> {
    try {
      const response = await ShopifyClientManager.mutation(COMPANY_ASSIGN_CUSTOMER_AS_CONTACT, storeName, {
        variables: { companyId, customerId }
      });

      if (response.data?.companyAssignCustomerAsContact?.userErrors?.length > 0) {
        throw new UserCreationError(
          response.data.companyAssignCustomerAsContact.userErrors[0].message,
          'COMPANY_ASSIGN_CUSTOMER_AS_CONTACT_ERROR'
        );
      }

      const companyContactId = response.data.companyAssignCustomerAsContact.companyContact.id;
      loggerService.info('Company contact assigned successfully', { companyContactId });
      return companyContactId;
    } catch (error) {
      loggerService.error('Failed to assign company contact', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        companyId,
        customerId
      });
      throw error;
    }
  }
}

export const companyContactService = new CompanyContactService(); 