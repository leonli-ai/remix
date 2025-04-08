// @/roles/getRoles/operation.ts
export const deleteRoleOperation = {
    tags: ['Company Management'],
    summary: 'Delete a role by id',
    description: 'Delete a role by id',
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
                        example: 'Role deleted successfully.'
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
        '404': {
            description: 'Not Found',
            schema: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'Status of the request',
                        example: '404'
                    },
                    message: {
                        type: 'string',
                        description: 'Error message',
                        example: 'Not Found.'
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