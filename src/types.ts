export interface TemplateMaster {
  id: number;
  name?: string;
}

export interface Page {
  id?: number;
  name?: string;
  uiSchema?: Record<string, unknown>;
  schema?: Record<string, unknown>;
  config?: Record<string, unknown>;
  templateMaster?: TemplateMaster;
  pageVersion?: number;
  status?: string;
  isDraft?: string;
  promotionStatus?: string;
  pageUrl?: string;
  createdOn?: string;
  modifiedOn?: string;
  createdBy?: number;
  isFinalised?: string;
  approvedOn?: string;
  templateName?: string;
}

export interface PageStaging extends Page {
  action?: number;
  main?: number;
  workflowBusinessKey?: string;
  isDeleted?: string;
}

export interface EntityReportRequest {
  entityName: string;
  type?: string;
  userId?: number;
  pageIndex?: number;
  size?: number;
  filters?: Record<string, unknown>;
}

export interface HyperformApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export interface GridLayout {
  lg?: number;
  md?: number;
  sm?: number;
  xs?: number;
}

export interface UiSchemaElement {
  type: string;
  scope?: string;
  config?: {
    main?: Record<string, unknown>;
    style?: Record<string, unknown>;
    layout?: GridLayout | number;
    defaultStyle?: boolean;
    wrapperStyle?: Record<string, unknown>;
    [key: string]: unknown;
  };
  options?: {
    widget?: string;
    [key: string]: unknown;
  };
  elements?: UiSchemaElement[];
  heading?: string;
  pageName?: string;
  accessorKey?: string;
  pageStyle?: Record<string, unknown>;
}
