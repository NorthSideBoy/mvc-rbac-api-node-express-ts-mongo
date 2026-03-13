import type Pagination from "../../operation/output/pagination.dto";
import type User from "./user.dto";

export default class SearchUser {
	docs: User[];
	pagination: Pagination;
}
