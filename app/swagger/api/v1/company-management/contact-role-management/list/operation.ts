// @/roles/getRoles/operation.ts
export const getRoleListOperation = {
    tags: ['Company Management'],
    summary: 'Get all available roles',
    description: 'Retrieves a list of all available roles in the system, including predefined and custom roles.',
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
                    roles: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    description: 'ID of the role',
                                    example: 'uuidRoleAdmin'
                                },
                                name: {
                                    type: 'string',
                                    description: 'Name of the role',
                                    example: 'Administrator'
                                },
                                note: {
                                    type: 'string',
                                    description: 'Note of the role',
                                    example: 'Full access to all system functionalities.'
                                },
                            }
                        }
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