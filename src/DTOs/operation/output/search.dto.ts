import type { Pagination } from "./pagination.dto";

export interface Search<T> {
	docs: T[];
	pagination: Pagination;
}
