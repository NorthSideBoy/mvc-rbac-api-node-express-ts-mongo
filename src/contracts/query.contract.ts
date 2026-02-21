export interface IQuery {
	page?: number;
	limit?: number;
	sort?: string;
	search?: string;
	createdAtFrom?: Date;
	createdAtTo?: Date;
}
