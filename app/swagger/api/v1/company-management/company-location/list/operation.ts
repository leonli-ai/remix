export const getCompanyLocationListOperation = {
    tags: ['Company Management'],
    summary: 'Get all company locations by company id',
    description: 'Get all company locations by company id',
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
                        example: 'gid://shopify/Company/7660306652'
                    }
                },
                required: ['storeName', 'customerId', 'companyId']
            }
        }


       
     
      
    ],
    responses: {
        '200': {
            description: 'Successfully retrieved user list',
            schema: {
                type: 'object',
                properties: {
                    page: {
                        type: 'integer',
                        description: 'Current page number',
                        example: 1
                    },
                    pageSize: {
                        type: 'integer',
                        description: 'Number of items per page',
                        example: 10
                    },
                    totalCount: {
                        type: 'integer',
                        description: 'Total number of users',
                        example: 1
                    },
                    companyLocations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                companyId:{
                                    type: 'string',
                                    description: 'ID of the company company',
                                    example: '123'
                                },
                                companyLocationId: {
                                    type: 'string',
                                    description: 'ID of the company location',
                                    example: '456465465456'
                                },
                                companyLocationName: {
                                    type: 'string',
                                    description: 'Name of the company location',
                                    example: 'Main Office'
                                },
                        
                                city: {
                                    type: 'string',
                                    description: 'City of the company location',
                                    example: 'New York'
                                },
                                state: {
                                    type: 'string',
                                    description: 'State of the company location',
                                    example: 'NY'
                                },
                                zipPostalCode: {
                                    type: 'string',
                                    description: 'Zip or postal code of the company location',
                                    example: '10001'
                                },
                                country: {
                                    type: 'string',
                                    description: 'Country of the company location',
                                    example: 'USA'
                                },
                                role: {
                                    type: 'string',
                                    description: 'Role associated with the company location',
                                    example: 'Admin'
                                }
                            }
                        }
                    },
                }
            }
        }
    }
}

