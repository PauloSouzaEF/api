type PaginationOrder = "asc" | "desc";

export interface RequestPagination<OrderByFields> {
	itemsPerPage: number;
	currentPage: number;
	orderBy: OrderByFields;
	order: PaginationOrder;
}

export interface ResponsePagination<TData, K = unknown>
	extends RequestPagination<K> {
	data: TData[];
	pageCount: number;
	totalCount: number;
}
