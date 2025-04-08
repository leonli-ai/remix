export const DRAFT_ORDER_COMPLETE = `
  mutation draftOrderComplete($id: ID!) {
    draftOrderComplete(id: $id) {
      draftOrder {
        id
        status
        metafields(first: 250, namespace: "$app:custom") {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
        order {
          id
        }
      }
      userErrors {
        message
        field
      }
    }
  }
`;

export const DRAFT_ORDER_CREATE = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_DRAFT_ORDER_TAGS_AND_METAF = `
mutation UpdateDraftOrderMetafield($input: DraftOrderInput!, $ownerId: ID!) {
  draftOrderUpdate(input: $input, id: $ownerId) {
    draftOrder {
      id
      metafield(namespace: "$app:custom", key: "operator_info") {
        id
        namespace
        key
        value
     }
    }
    userErrors {
      message
      field
    }
  }
}
`;

export const DRAFT_ORDER_BULK_DELETE = `
  mutation DraftOrderBulkDelete($ids: [ID!], $search: String) {
    draftOrderBulkDelete(ids: $ids, search: $search) {
      job {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`; 