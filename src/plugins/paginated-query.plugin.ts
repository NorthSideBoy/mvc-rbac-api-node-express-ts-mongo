import type { Model, Schema } from "mongoose";

const filterableFieldsMap = new Map<
  string,
  Array<{
    dtoField: string;
    field: string;
    from?: string;
    to?: string;
    range?: boolean;
    type?: string;
  }>
>();
const sorteableFieldsMap = new Map<string, Set<string>>();

function inferPropertyType(target: any, propertyKey: string): string {
  const designType = Reflect.getMetadata("design:type", target, propertyKey);
  if (designType) {
    if (designType === String) return "string";
    if (designType === Number) return "number";
    if (designType === Boolean) return "boolean";
    if (designType === Date) return "date";
  }
  return "string";
}

function generateRangeFields(propertyName: string) {
  return {
    from: `${propertyName}From`,
    to: `${propertyName}To`,
  };
}

export function filterable(config?: { range?: boolean; type?: string }): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const className = target.constructor.name;
    const propName = propertyKey as string;
    const inferredType = inferPropertyType(target, propName);
    const fieldType = config?.type || inferredType;

    const filterConfig: any = {
      dtoField: propName,
      field: propName,
      type: fieldType,
    };

    if (config?.range) {
      const rangeFields = generateRangeFields(propName);
      filterConfig.from = rangeFields.from;
      filterConfig.to = rangeFields.to;
      filterConfig.range = true;
    }

    const existing = filterableFieldsMap.get(className) || [];
    filterableFieldsMap.set(className, [...existing, filterConfig]);
  };
}

export function sorteable(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const className = target.constructor.name;
    const existing = sorteableFieldsMap.get(className) || new Set();
    existing.add(propertyKey as string);
    sorteableFieldsMap.set(className, existing);
  };
}

function getFilterableFields(target: any) {
  const className = target.modelName || target.constructor?.name;
  return filterableFieldsMap.get(className) || [];
}

function getSorteableFields(target: any): Set<string> {
  const className = target.modelName || target.constructor?.name;
  return sorteableFieldsMap.get(className) || new Set();
}

type SortDirection = 1 | -1;
type SortSpec = Record<string, SortDirection>;

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

interface Result<T> {
  docs: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginateModel<T> extends Model<T> {
  paginate: (
    query?: any,
    options?: { page?: number; limit?: number; sort?: Record<string, 1 | -1>, lean?:boolean },
  ) => Promise<Result<T>>;
  buildFilters(input: Record<string, any>): Record<string, any>;
  getPaginationOptions(options?: any): { page: number; limit: number; sort: SortSpec };
  formatQuery<T>(result: any, page: number, limit: number): Result<T>;
}
export class QueryBuilder {
  private defaultPage = 1;
  private defaultLimit = 10;
  private maxLimit = 100;
  private defaultSort: SortSpec;
  private sorteableFields: Set<string>;

  constructor(sorteableFields: Set<string>, defaultSort?: SortSpec) {
    this.defaultSort = defaultSort || { createdAt: -1 };
    this.sorteableFields = sorteableFields;
  }

  escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  buildRange(from?: any, to?: any, type?: string): Record<string, any> | undefined {
    if (type === "number") {
      const range: Record<string, number> = {};
      if (from !== undefined) range.$gte = Number(from);
      if (to !== undefined) range.$lte = Number(to);
      return Object.keys(range).length ? range : undefined;
    }

    if (type === "date") {
      const range: Record<string, Date> = {};
      if (from) range.$gte = new Date(from);
      if (to) range.$lte = new Date(to);
      return Object.keys(range).length ? range : undefined;
    }

    const range: Record<string, any> = {};
    if (from !== undefined) range.$gte = from;
    if (to !== undefined) range.$lte = to;
    return Object.keys(range).length ? range : undefined;
  }

  buildSort(sort?: string): SortSpec {
    if (!sort) return this.defaultSort;

    const sortFields = sort
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    const sortQuery: SortSpec = {};

    for (const field of sortFields) {
      const direction = field.startsWith("-") ? -1 : 1;
      const key = field.replace(/^[-+]/, "");
      if (this.sorteableFields.has(key)) {
        sortQuery[key] = direction;
      }
    }

    return Object.keys(sortQuery).length ? sortQuery : this.defaultSort;
  }

  buildFilters(
    input: Record<string, any>,
    filterableFields: Array<{
      dtoField: string;
      field: string;
      from?: string;
      to?: string;
      range?: boolean;
      type?: string;
    }>,
  ): Record<string, any> {
    const filters: Record<string, any> = {};

    for (const config of filterableFields) {
      if (config.from || config.to) {
        const fromValue = config.from ? input[config.from] : undefined;
        const toValue = config.to ? input[config.to] : undefined;
        if (fromValue !== undefined || toValue !== undefined) {
          filters[config.field] = this.buildRange(fromValue, toValue, config.type);
        }
      } else {
        const value = input[config.dtoField];
        if (value === undefined || value === null) continue;

        if (value instanceof Date) {
          filters[config.field] = value;
        } else if (typeof value === "string" && value.includes("*")) {
          const pattern = value.replace(/\*/g, ".*");
          filters[config.field] = new RegExp(`^${pattern}$`, "i");
        } else if (Array.isArray(value)) {
          filters[config.field] = { $in: value };
        } else if (typeof value === "object" && value !== null && value.operator) {
          const op = value.operator;
          const val = value.value;
          switch (op) {
            case "neq":
              filters[config.field] = { $ne: val };
              break;
            case "gt":
              filters[config.field] = { $gt: val };
              break;
            case "gte":
              filters[config.field] = { $gte: val };
              break;
            case "lt":
              filters[config.field] = { $lt: val };
              break;
            case "lte":
              filters[config.field] = { $lte: val };
              break;
            case "like":
              filters[config.field] = new RegExp(this.escapeRegex(val), "i");
              break;
            default:
              filters[config.field] = val;
          }
        } else {
          filters[config.field] = value;
        }
      }
    }

    if (input.search) {
      const stringFields = filterableFields
        .filter((f) => !f.from && !f.to && f.type === "string")
        .map((f) => f.field);
      if (stringFields.length > 0) {
        filters.$or = stringFields.map((field) => ({
          [field]: new RegExp(this.escapeRegex(input.search), "i"),
        }));
      }
    }

    return filters;
  }

  getPaginationOptions(options?: PaginationOptions) {
    return {
      page: options?.page ?? this.defaultPage,
      limit: Math.min(options?.limit ?? this.defaultLimit, this.maxLimit),
      sort: this.buildSort(options?.sort),
    };
  }

  formatQuery<T>(result: any, page: number, limit: number): Result<T> {
    return {
      docs: result.docs as T[],
      pagination: {
        total: result.totalDocs ?? 0,
        pages: result.totalPages ?? 0,
        page: result.page ?? page,
        limit: result.limit ?? limit,
        hasNext: result.hasNextPage ?? false,
        hasPrev: result.hasPrevPage ?? false,
      },
    };
  }
}

export function paginatedQueryPlugin(schema: Schema, defaultSort?: SortSpec) {
  schema.statics.buildFilters = function (input: Record<string, any>) {
    const filterableFields = getFilterableFields(this);
    const sorteableFields = getSorteableFields(this);
    const builder = new QueryBuilder(sorteableFields, defaultSort);
    return builder.buildFilters(input, filterableFields);
  };

  schema.statics.getPaginationOptions = function (options?: PaginationOptions) {
    const sorteableFields = getSorteableFields(this);
    const builder = new QueryBuilder(sorteableFields, defaultSort);
    return builder.getPaginationOptions(options);
  };

  schema.statics.formatQuery = function (result: any, page: number, limit: number) {
    const sorteableFields = getSorteableFields(this);
    const builder = new QueryBuilder(sorteableFields, defaultSort);
    return builder.formatQuery(result, page, limit);
  };

  schema.statics.escapeRegex = function (value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  schema.statics.buildRange = function (from?: any, to?: any, type?: string) {
    const builder = new QueryBuilder(new Set(), defaultSort);
    return builder.buildRange(from, to, type);
  };

  schema.statics.buildSort = function (sort?: string) {
    const sorteableFields = getSorteableFields(this);
    const builder = new QueryBuilder(sorteableFields, defaultSort);
    return builder.buildSort(sort);
  };
}

export default paginatedQueryPlugin;