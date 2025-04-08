interface MetafieldDefinition {
  namespace: string;
  key: string;
  ownerType: string;
  name: string;
  type: string;
  description?: string;
  access?: {
    admin: string;
    storefront: string;
    customerAccount: string;
  };
}

interface MetafieldsSetInput {
  namespace: string;
  key: string;
  value: string;
  ownerId: string
  type: string
}

export async function checkMetafieldDefinition(admin: any, definition: MetafieldDefinition) {
  const response = await admin.graphql(
    `#graphql
    query GetMetafieldDefinition($namespace: String!, $key: String!, $ownerType: MetafieldOwnerType!) {
      metafieldDefinitions(first: 1, ownerType: $ownerType, namespace: $namespace, key: $key) {
        nodes {
          id
          name
        }
      }
    }`,
    {
      variables: {
        namespace: definition.namespace,
        key: definition.key,
        ownerType: definition.ownerType,
      }
    }
  );
  const json = await response.json();
  return json.data?.metafieldDefinitions?.nodes || [];
}

export async function createMetafieldDefinition(admin: any, definition: MetafieldDefinition) {
  const response = await admin.graphql(
    `#graphql
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          name
        }
        userErrors {
          field
          message
          code
        }
      }
    }`,
    {
      variables: {
        definition
      }
    }
  );
  return response.json();
}

export async function setMetafieldValue(admin: any, data: MetafieldsSetInput, ) {
  const response = await admin.graphql(
    `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key
        namespace
        value
        createdAt
        updatedAt
      }
      userErrors {
        field
        message
        code
      }
    }
  }`,
    {
      variables: {
        "metafields": [
          data
        ]
      },
    },
  );
  return response.json();
}
