export interface IPet {
    id?: number,
    category?: { [key: string]: any },
    name: string,
    photoUrls: string[]
    tags?: { [key: string]: any },
    status?: string,
}

export interface IPokemonResults {
    name: string,
    url: string
}

/**
 * @description GoRestApi User Entity
 */
export interface IUser {
    id?: number,
    name?: string,
    email?: string,
    gender?: string,
    status?: string,
}

export enum PaginationType {
    PAGE_PAGINATION = 'page',
    OFFSET_PAGINATION = 'offset',
    CURSOR_PAGINATION = 'cursor',
}

export interface IPagination {
    paginateRequest?: boolean,
    pageNumber?: number,
    limit?: number,
    offset?: number,
    cursorKey?: string,
    paginationType?: PaginationType,
}

export interface IRequestOptions<T> {
    queryParams?: { [key: string]: any },
    requestData?: { [key: string]: T },
    isAuthorizationRequired?: boolean,
    isMultiPart?: boolean,
    multiPartData?: { [key: string]: any },
}

export interface IResponseOptions {
    responseDataKey?: string,
    responseKey?: string,
}

export type ApiOptionalParams<T> = IRequestOptions<T> & IResponseOptions & IPagination