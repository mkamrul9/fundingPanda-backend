
export interface IQueryParams {
    searchTerm?: string;
    page?: string | number;
    limit?: string | number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    fields?: string;
    include?: string;
    [key: string]: unknown;
}

export interface IQueryConfig {
    searchableFields?: string[];
    filterableFields?: string[];
}

export interface IQueryResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export type PrismaModelDelegate = any;
export type PrismaFindManyArgs = any;
export type PrismaCountArgs = any;
export type PrismaWhereConditions = any;
export type PrismaStringFilter = any;
export type PrismaNumberFilter = any;