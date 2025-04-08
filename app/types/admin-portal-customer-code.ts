export interface AdminPortalCustomerCodeListParams {
    storeName: string,
    pagination: {
      page: number,
      pageSize: number
    },
    filter?: {
      skuId?: string,
      customerPartnerNumber?: string,
      productTitle?: string,
      companyId?: string
    },
    sort?: {
      sortBy?: string,
      sortOrder?: "desc" | "asc"
    }
  }

export interface AdminPortalCustomerCode {
    id: number,
    storeName: string,
    skuId: string,
    companyId: string,
    customerPartnerNumber: string,
    productTitle: string,
    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string
}

export interface AdminPortalCustomerCodeListResponse {
    page: number,
    pageSize: number,
    totalCount: number,
    items: AdminPortalCustomerCode[]
  } 

  export interface AdminPortalDeleteCustomerPartnerNumberParams {
    storeName: string,
    ids: number[]
  }

 export interface AdminPortalCompany {
    id: string,
    name: string
 }

