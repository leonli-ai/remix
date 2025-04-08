export type FilterType =
  | "status"
  | "order_number"
  | "po_number"
  | "created_at"
  | "updated_at";

export type FilterTag<T extends string> = {
  type: T;
  value: string;
  label: string;
};

export type MatchType = "" | "contains" | "exact" | "on or after";

export type FilterConfig = {
  label: string;
  type: "select" | "input" | "date";
  placeholder: string;
  options?: Array<{ value: string; label: string }>;
  usePrefix?: boolean;
  queryField?: string;
  operator?: string;
  matchType: MatchType;
};

export type DynamicFilterValueTypes = string | Date;
