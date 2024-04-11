import { APIRequestContext, APIResponse } from '@playwright/test';

export enum RequestMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

export enum StatusCode {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    SERVER_ERROR = 500,
}

export enum PaginationType {
    PAGE_PAGINATION = 'page',
    OFFSET_PAGINATION = 'offset',
    CURSOR_PAGINATION = 'cursor',
}


export interface ApiOptionalParams<T> {
    responseDataKey?: string,
    queryParams?: { [key: string]: any },
    requestData?: { [key: string]: T },
    authoriaztionRequired?: boolean,
    isMultiPart?: boolean,
    multiPartData?: { [key: string]: any },
    paginateRequest?: boolean,
    pagePagination?: boolean,
    limitOffsetPagination?: boolean,
    pageNumber?: number,
    limit?: number,
    offset?: number,
    cursor?: boolean,
    cursorKey?: string,
    paginationType?: PaginationType,
    responseKey?: string,
}

export class ApiClient {
    constructor(public request: APIRequestContext) {
        this.request = request;
    }

    /**
       * @description resuable code to add the authorization header if an  authorization is requiired to make the request
       * @param headers 
       */
    private async addAuthorizationHeader(headers: { [key: string]: string }) {
        headers['Authorization'] = `Bearer ${process.env.API_TOKEN}`
    }

    /**
     * @description this functions provides a generic encapsulated HTTP methods with variety of options depends on your individual request
     * @param method 
     * @param url 
     * @param options 
     * @returns 
     */
    private async makeRequest<T>(method: RequestMethods, url: string, options?: ApiOptionalParams<T>): Promise<APIResponse | undefined> {
        let response: APIResponse | undefined
        let headers: Record<string, string> = {
            'Accept': '*/*'
        }
        if (options?.isMultiPart) {
            headers["Content-Type"] = 'multipart/form-data'
        } else {
            headers["Content-Type"] = 'application/json'
        }
        if (options?.authoriaztionRequired) {
            await this.addAuthorizationHeader(headers)
        }
        switch (method.valueOf()) {
            case 'GET':
                response = await this.request.get(url, { headers, params: options?.queryParams })
                break;
            case 'POST':
                response = await this.request.post(url, { headers, data: options?.requestData, multipart: options?.multiPartData! })
                break;
            case 'PUT':
                response = await this.request.put(url, { headers, data: options?.requestData, multipart: options?.multiPartData! })
                break;
            case 'PATCH':
                response = await this.request.patch(url, { headers, data: options?.requestData, multipart: options?.multiPartData! })
                break;
            case 'DELETE':
                response = await this.request.delete(url)
                break;
        }
        return response
    }


    // private async paginateBy<T>(paginationType: PaginationType, options?: ApiOptionalParams<T>): Promise<{ [key: string]: any }> {
    //     let existingQueryParams = { ...options?.queryParams }
    //     let newParams = {}
    //     switch (paginationType) {
    //         case PaginationType.PAGE_PAGINATION:
    //             newParams = { ...existingQueryParams, 'page': options?.pageNumber }
    //             break;
    //         case PaginationType.OFFSET_PAGINATION:
    //             newParams = { ...existingQueryParams, 'limit': options?.limit, 'offset': options?.offset }
    //             break;
    //     }
    //     return newParams;
    // }

    /**
     * @description handle the response object by spreading it to an existing array if the response is already an array otherwise push directly
     * to the array.
     * @param responseObj 
     */
    private async handleResponseObject(responses: APIResponse[], responseObj: any) {
        if (Array.isArray(responseObj)) {
            responses.push(...responseObj)
        } else {
            responses.push(responseObj);
        }
    }

    public async paginateRequest<T>(method: RequestMethods, url: string, pagintionType: PaginationType, options: ApiOptionalParams<T>): Promise<APIResponse[] | undefined> {
        let response: APIResponse | undefined
        let responses: APIResponse[] = []
        let existingQueryParams = { ...options.queryParams }
        try {
            while (true) {
                response = await this.makeRequest(method, url, options);
                let responseObj = await response?.json();
                if (!responseObj || responseObj.length === 0) {
                    break;
                }
                if (options?.responseKey) {
                    let responseKey = responseObj[options.responseKey]
                    if (responseKey.length === 0) {
                        break;
                    }
                    await this.handleResponseObject(responseKey, responses);

                } else {
                    await this.handleResponseObject(responseObj, responses);
                }
                switch (pagintionType) {
                    case PaginationType.PAGE_PAGINATION:
                        if (options.pageNumber !== undefined) {
                            existingQueryParams['page'] = options.pageNumber
                            options.pageNumber++

                        }
                        break;
                    case PaginationType.OFFSET_PAGINATION:
                        if (options.offset !== undefined && options.limit !== undefined) {
                            existingQueryParams['limit'] = options.limit
                            existingQueryParams['offset'] = options.offset
                            options.offset += options.limit;
                        }
                        break;
                }
            }
            return responses;
        } catch (error) {
            throw new Error(`something went wrong in one of the paginateRequest function conditions - please refer to paginateRequest function `)
        }
    }

    // private incrementPaginationParams<T>(paginationType: PaginationType, options: ApiOptionalParams<T>) {
    //     switch (paginationType) {
    //         case PaginationType.PAGE_PAGINATION:
    //             if (options.pageNumber !== undefined) {
    //                 options.pageNumber++;
    //             }
    //             break;
    //         case PaginationType.OFFSET_PAGINATION:
    //             if (options.offset !== undefined && options.limit !== undefined) {
    //                 options.offset += options.limit;
    //             }
    //             break;
    //     }
    // }

    public async paginateHttpRequest<T>(method: RequestMethods, url: string, paginationType: PaginationType, options?: ApiOptionalParams<T>) {
        if (options?.paginateRequest) {
            let responses = await this.paginateRequest(method, url, options.paginationType!, options);
            if (responses === undefined) {
                throw new Error('the response object is udnefined in the paginateHttpRequest ');
            }
            return responses;
        } else {
            throw new Error('pagination options may not have been provided in the makePaginatedHttpRequest');
        }
    }

    private async makeHttpRequest<T>(method: RequestMethods, url: string, options?: ApiOptionalParams<T>) {
        let response = await this.makeRequest(method, url, options)
        return response;
    }

    public async get<T>(url: string, options?: ApiOptionalParams<T>) {
        let response = await this.makeHttpRequest(RequestMethods.GET, url, options)
        return response;
    }

    public async post<T>(url: string, options?: ApiOptionalParams<T>) {
        let response = await this.makeHttpRequest(RequestMethods.POST, url, options)
        return response;
    }

    public async put<T>(url: string, options?: ApiOptionalParams<T>) {
        let response = await this.makeHttpRequest(RequestMethods.PUT, url, options)
        return response;
    }

    public async patch<T>(url: string, options?: ApiOptionalParams<T>) {
        let response = await this.makeHttpRequest(RequestMethods.PATCH, url, options)
        return response;
    }

    public async delete<T>(url: string, options?: ApiOptionalParams<T>) {
        let response = await this.makeHttpRequest(RequestMethods.DELETE, url, options)
        return response;
    }
}