export default interface Pagination {
	page: number;
	limit: number;
	total: number;
	pages: number;
	hasNext: boolean;
	hasPrev: boolean;
}
