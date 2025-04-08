// @/roles/getRoles/operation.ts
export const createRoleOperation = {
    tags: ['Company Management'],
    summary: 'Create a new role',
    description: 'Create a new role',
    parameters: [
    {
        name: 'body',
        in: 'body',
        required: true,
        schema: {
            type: 'object',
            properties: {
                data: {
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
                        data: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Name of the role',
                                    example: 'Administrator'
                                },
                                note: {
                                    type: 'string',
                                    description: 'Note of the role',
                                    example: 'Full access to all system functionalities.'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ],
    responses: {
        '200': {
            description: 'Successfully retrieved roles list',
            schema: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'Status of the request',
                        example: '200'
                    },
                    message: {
                        type: 'string',
                        description: 'Success message',
                        example: 'Role created successfully.'
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
                        example: 'Bad Request.'
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
                        example: 'Internal Server Error.'
                    }
                }
            }
        }
    }
};