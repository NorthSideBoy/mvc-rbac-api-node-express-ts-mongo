export type Query = {
	page?: number;
	limit?: number;
	sort?: string;
	search?: string;

	createdAtFrom?: Date;
	createdAtTo?: Date;
	updatedAtFrom?: Date;
	updatedAtTo?: Date;
};
