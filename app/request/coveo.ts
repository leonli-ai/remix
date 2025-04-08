export const GET_PRODUCTS = `
query ProductIndexCompanyLocationPublications($first: Int!) {
    products(first: $first) {
        nodes {
            id
            title
            vendor
            category {
                fullName
            }
            description
            handle
            options(first: 10) {
                name
                optionValues {
                    name
                }
            }
            images(first: 10) {
                nodes {
                    url
                    altText
                }
            }
            resourcePublicationsV2(
                first: 10
                catalogType: COMPANY_LOCATION
                onlyPublished: true
            ) {
                nodes {
                    publication {
                        catalog {
                            id
                            title
                            status
                            priceList {
                                parent {
                                    adjustment {
                                        value
                                        type
                                    }
                                }
                            }
                        }
                    }
                }
            }
            totalInventory
            variants(first: 10) {
                nodes {
                    id
                    title
                    price
                    sku
                    inventoryQuantity
                    availableForSale
                    inventoryItem {
                        id
                        inventoryLevels(first: 20) {
                            edges {
                                node {
                                    location {
                                        id   
                                    }
                                    quantities(names: "available") {
                                        id
                                        name
                                        quantity
                                    }
                                }
                            }
                        }
                    }
                    metafields(first: 10,namespace: "$app:custom") {
                        nodes {
                            value
                            namespace
                            key
                        }
                    }
                }
            }
        }
    }
}
`