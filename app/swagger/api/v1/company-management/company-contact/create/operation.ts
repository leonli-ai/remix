export const createUserOperation = {
    tags: ['Company Management'],
    summary: 'Create a new user account',
    description: 'Creates a new user account with specified roles and permissions.',
    parameters: [
        {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
                type: 'object',
                properties: {
                    storeName: {
                        type: 'string',
                        description: 'Name of the store',
                        example: 'b2b-accelerator.myshopify.com'
                    },
                    customerId: {
                        type: 'string',
                        description: 'ID of the customer',
                        example: 'gid://shopify/Customer/132134421'
                    },
                    companyId: {
                        type: 'string',
                        description: 'ID of the company',
                        example: 'gid://shopify/Company/132134421'
                    },
                    data:{
                        type: 'object',
                        properties: {
                        firstName: {
                            type: 'string',
                            description: 'First name of the user',
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            description: 'Last name of the user',
                            example: 'Doe'
                        },
                        email: {
                            type: 'string',
                            description: 'Email address of the user',
                            example: 'john.doe@example.com'
                        },
                        accountStatus: {
                            type: 'string',
                            description: 'Status of the user account',
                            enum: ['ENABLED', 'DISABLED'],
                            example: 'ENABLED'
                        },
                        password: {
                            type: 'string',
                            description: 'Password for the user account',
                            example: 'SecureP@ssw0rd'
                        },
                        companyLocations: {
                            type: 'array',
                            description: 'List of company locations with roles and permissions',
                            items: {
                                type: 'object',
                                properties: {
                                    locationId: {
                                        type: 'string',
                                        description: 'ID of the company location',
                                        example: 'uuidLocation1'
                                    },
                                    roleId: {
                                        type: 'string',
                                        description: 'Role id assigned to the location',
                                        example: '1'
                                    }
                                },
                                required: ['locationId', 'roleId']
                            }
                        }
                    }
                },
            }
            
        }
        }
    ],
    security: [{ bearerAuth: [] }],
    responses: {
        '201': {
            description: 'Successfully created user account',
            schema: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID of the created user',
                        example: 'uuidUser1'
                    },
                    firstName: {
                        type: 'string',
                        description: 'First name of the user',
                        example: 'John'
                    },
                    lastName: {
                        type: 'string',
                        description: 'Last name of the user',
                        example: 'Doe'
                    },
                    email: {
                        type: 'string',
                        description: 'Email address of the user',
                        example: 'john.doe@example.com'
                    },
                    accountStatus: {
                            type: 'string',
                            description: 'Status of the user account',
                            example: 'ENABLED'
                    },
                    roles: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                locationId: {
                                    type: 'string',
                                    description: 'ID of the company location',
                                    example: 'uuidLocation1'
                                },
                                roleId: {
                                    type: 'string',
                                    description: 'ID of the role assigned to the location',
                                    example: 'uuidRoleAdmin'
                                }
                            }
                        }
                    },
                    locations: {
                        type: 'array',
                        items: {
                            type: 'string',
                            description: 'List of location IDs that can receive shipments',
                            example: ['uuidLocation2', 'uuidLocation3']
                        }
                    },
                    createdAt: {
                        type: 'string',
                        description: 'Creation date of the user account',
                        example: '2024-12-25T12:34:56Z'
                    },
                    updatedAt: {
                        type: 'string',
                        description: 'Last update date of the user account',
                        example: '2024-12-25T12:34:56Z'
                    }
                }
            }
        },
        '400': {
            description: 'Bad Request',
            schema: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'Status of the request',
                        example: '400'
                    },
                    message: {
                        type: 'string',
                        description: 'Error message',
                        example: 'Invalid input'
                    }
                }
            }
        },
        '401': {
            description: 'Unauthorized',
            schema: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'Status of the request',
                        example: '401'
                    },
                    message: {
                        type: 'string',
                        description: 'Error message',
                        example: 'Unauthorized'
                    }
                }
            }
        },
        '403': {
            description: 'Forbidden',
            schema: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'Status of the request',
                        example: '403'
                    },
                    message: {
                        type: 'string',
                        description: 'Error message',
                        example: 'Forbidden'
                    }
                }
            }
        },
        '409': {
            description: 'Conflict',
            schema: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'Status of the request',
                        example: '409'
                    },
                    message: {
                        type: 'string',
                        description: 'Error message',
                        example: 'User already exists'
                    }
                }
            }
        },
        '500': {
            description: 'Internal Server Error',
            schema: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'Status of the request',
                        example: '500'
                    },
                    message: {
                        type: 'string',
                        description: 'Error message',
                        example: 'Internal Server Error'
                    }
                }
            }
        }
    }
};