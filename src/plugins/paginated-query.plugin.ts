import type { Model, Schema } from "mongoose";

export interface FilterConfig {
	range?: boolean;
	type?: "string" | "number" | "boolean" | "date" | "enum";
}

const FILTER_METADATA_KEY = Symbol("filter:metadata");
const SORT_METADATA_KEY = Symbol("sort:metadata");

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

function generateRangeFields(propertyName: string): {
	from: string;
	to: string;
} {
	return {
		from: `${propertyName}From`,
		to: `${propertyName}To`,
	};
}

export function filterable(config?: FilterConfig): PropertyDecorator {
	return (target: any, propertyKey: string | symbol) => {
		const targetConstructor = target.constructor;
		const className = targetConstructor.name;
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

			const rangeTypes = ["number", "date"];
			if (!rangeTypes.includes(fieldType)) {
				console.warn(
					`[@filterable] range=true on "${propName}" (type: ${fieldType}) - fully supported only for: ${rangeTypes.join(", ")}`,
				);
			}
		}

		const existingFilters = filterableFieldsMap.get(className) || [];
		filterableFieldsMap.set(className, [...existingFilters, filterConfig]);

		const existingMetadata =
			Reflect.getMetadata(FILTER_METADATA_KEY, targetConstructor) || [];
		Reflect.defineMetadata(
			FILTER_METADATA_KEY,
			[...existingMetadata, filterConfig],
			targetConstructor,
		);
	};
}

export function sorteable(): PropertyDecorator {
	return (target: any, propertyKey: string | symbol) => {
		const targetConstructor = target.constructor;
		const className = targetConstructor.name;

		const existingSortFields = sorteableFieldsMap.get(className) || new Set();
		existingSortFields.add(propertyKey as string);
		sorteableFieldsMap.set(className, existingSortFields);

		const existingMetadata =
			Reflect.getMetadata(SORT_METADATA_KEY, targetConstructor) || [];
		Reflect.defineMetadata(
			SORT_METADATA_KEY,
			[...existingMetadata, propertyKey as string],
			targetConstructor,
		);
	};
}

function getFilterableFieldsFromTarget(target: any): Array<{
	dtoField: string;
	field: string;
	from?: string;
	to?: string;
	range?: boolean;
	type?: string;
}> {
	if (target.constructor) {
		const fromMetadata = Reflect.getMetadata(
			FILTER_METADATA_KEY,
			target.constructor,
		);
		if (fromMetadata) return fromMetadata;
	}

	if (target.constructor?.name) {
		const fromMap = filterableFieldsMap.get(target.constructor.name);
		if (fromMap) return fromMap;
	}

	if (target.modelName) {
		const fromMap = filterableFieldsMap.get(target.modelName);
		if (fromMap) return fromMap;
	}

	return [];
}

function getSorteableFieldsFromTarget(target: any): Set<string> {
	const fields = new Set<string>();

	if (target.constructor) {
		const fromMetadata = Reflect.getMetadata(
			SORT_METADATA_KEY,
			target.constructor,
		);
		if (fromMetadata) {
			for (const field of fromMetadata) {
				fields.add(field);
			}
		}
	}

	if (target.constructor?.name) {
		const fromMap = sorteableFieldsMap.get(target.constructor.name);
		if (fromMap) {
			for (const field of fromMap) {
				fields.add(field);
			}
		}
	}

	if (target.modelName) {
		const fromMap = sorteableFieldsMap.get(target.modelName);
		if (fromMap) {
			for (const field of fromMap) {
				fields.add(field);
			}
		}
	}

	return fields;
}

export type SortDirection = 1 | -1;
export type SortSpec = Record<string, SortDirection>;

export interface PaginationOptions {
	page?: number;
	limit?: number;
	sort?: string;
}

export interface IQuery<T> {
	docs: T[];
	pagination: {
		total: number;
		pages: number;
		page: number;
		limit: number;
		hasNext: boolean;
		hasPrev: boolean;
	}
}

export interface PaginateModel<T> extends Model<T> {
	paginate: (
		query?: any,
		options?: { page?: number; limit?: number; sort?: Record<string, 1 | -1> },
	) => Promise<IQuery<T>>;
	buildFilters(input: Record<string, any>): Record<string, any>;
	getPaginationOptions(options?: PaginationOptions): {
		page: number;
		limit: number;
		sort: SortSpec;
	};
	formatQuery<T>(
		result: any,
		page: number,
		limit: number,
	): IQuery<T>;
}

export class QueryBuilder {
	private defaultPage: number;
	private defaultLimit: number;
	private maxLimit: number;
	private defaultSort: SortSpec;
	private sorteableFields: Set<string>;

	constructor(sorteableFields: Set<string>, defaultSort?: SortSpec) {
		this.defaultPage = 1;
		this.defaultLimit = 10;
		this.maxLimit = 100;
		this.defaultSort = defaultSort || { createdAt: -1 };
		this.sorteableFields = sorteableFields;
	}

	escapeRegex(value: string): string {
		return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	buildRange(
		from?: any,
		to?: any,
		type?: string,
	): Record<string, any> | undefined {
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

			if (!this.sorteableFields.has(key)) continue;

			sortQuery[key] = direction;
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
					filters[config.field] = this.buildRange(
						fromValue,
						toValue,
						config.type,
					);
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
				} else if (
					typeof value === "object" &&
					value !== null &&
					value.operator
				) {
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

	formatQuery<T>(
		result: any,
		page: number,
		limit: number,
	): IQuery<T> {
		return {
			docs: result.docs as T[],
			pagination: {
				total: result.totalDocs ?? 0,
				pages: result.totalPages ?? 0,
				page: result.page ?? page,
				limit: result.limit ?? limit,
				hasNext: result.hasNextPage ?? false,
				hasPrev: result.hasPrevPage ?? false,
			}
		};
	}
}

export function paginatedQueryPlugin(schema: Schema, defaultSort?: SortSpec) {
	schema.statics.buildFilters = function (input: Record<string, any>) {
		const filterableFields = getFilterableFieldsFromTarget(this);
		const sorteableFields = getSorteableFieldsFromTarget(this);

		const builder = new QueryBuilder(sorteableFields, defaultSort);
		return builder.buildFilters(input, filterableFields);
	};

	schema.statics.getPaginationOptions = function (options?: PaginationOptions) {
		const sorteableFields = getSorteableFieldsFromTarget(this);
		const builder = new QueryBuilder(sorteableFields, defaultSort);
		return builder.getPaginationOptions(options);
	};

	schema.statics.formatQuery = function (
		result: any,
		page: number,
		limit: number,
	) {
		const sorteableFields = getSorteableFieldsFromTarget(this);
		const builder = new QueryBuilder(sorteableFields, defaultSort);
		return builder.formatQuery(result, page, limit);
	};

	schema.statics.escapeRegex = (value: string) =>
		value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	// biome-ignore lint: static method assignment
	schema.statics.buildRange = (from?: any, to?: any, type?: string) => {
		const builder = new QueryBuilder(new Set(), defaultSort);
		return builder.buildRange(from, to, type);
	};

	// biome-ignore lint: dynamic method assignment for static methods
	schema.statics.buildSort = function (sort?: string) {
		const sorteableFields = getSorteableFieldsFromTarget(this);
		const builder = new QueryBuilder(sorteableFields, defaultSort);
		return builder.buildSort(sort);
	};
}

export default paginatedQueryPlugin;
