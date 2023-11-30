import { APIRequestContext, APIResponse, expect } from "@playwright/test";

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

export class ApiRequests {
    constructor(public apiRequestContext: APIRequestContext) {
        this.apiRequestContext = apiRequestContext
    }

    /**
     * @description resuable code to add the authorization header is an  authorization is requiired to make the request
     * @param headers 
     */
    private async addAuthorizationHeader(headers: { [key: string]: string }) {
        headers['Authorization'] = `Bearer ${process.env.TOKEN}`
    }

    /**
     * @description this functions provides a generic encapsulated HTTP methods with variety of options depends on your individual request
     * @param method 
     * @param url 
     * @param options 
     * @returns 
     */
    private async makeRequest<T>(method: RequestMethods, url: string, options?: { queryParams?: { [key: string]: T | any }, requestData?: { [key: string]: T }, authoriaztionRequired?: boolean, isMultiPart?: boolean, multipartObject?: { [key: string]: any } }): Promise<APIResponse | undefined> {
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
            case RequestMethods.GET:
                response = await this.apiRequestContext.get(url, { headers, params: options?.queryParams })
                break;
            case RequestMethods.POST:
                response = await this.apiRequestContext.post(url, { headers, data: options?.requestData, multipart: options?.multipartObject! })
                break;
            case RequestMethods.PUT:
                response = await this.apiRequestContext.put(url, { headers, data: options?.requestData, multipart: options?.multipartObject! })
                break;
            case RequestMethods.PATCH:
                response = await this.apiRequestContext.patch(url, { headers, data: options?.requestData, multipart: options?.multipartObject! })
                break;
            case RequestMethods.DELETE:
                response = await this.apiRequestContext.delete(url)
                break;
        }
        return response
    }

    /**
     * @description function that supports pagination via page pagination or by limit and offset pagination
     */
    private async paginateRequest<T>(method: RequestMethods, url: string, options?: {
        pagePagination?: boolean,
        limitOffsetPagination?: boolean,
        queryParams?: { [key: string]: any },
        pageNumber?: number, limit?: number,
        offset?: number, requestData?: { [key: string]: T },
        authoriaztionRequired?: boolean,
        responseDataKey?: string,
        limitNumber?: number
    }) {
        let existingQueryParams = { ...options?.queryParams }
        let response: APIResponse | undefined
        try {
            while (true) {
                if (options?.pagePagination && options?.pageNumber !== undefined) {
                    let page = options?.pageNumber
                    existingQueryParams['page'] = page
                    response = await this.makeRequest(method, url, { queryParams: existingQueryParams, requestData: options.requestData, authoriaztionRequired: options.authoriaztionRequired })
                    let responseObject = await response?.json()
                    if (!responseObject || responseObject.length === 0) {
                        break
                    }
                    options.pageNumber = page
                    page++
                }
                if (options?.limitOffsetPagination) {
                    existingQueryParams['limit'] = options.limit
                    existingQueryParams['offset'] = options.offset
                    response = await this.makeRequest(method, url, { queryParams: existingQueryParams, requestData: options.requestData, authoriaztionRequired: options.authoriaztionRequired })
                    let responseObject = await response?.json()
                    if (!responseObject || responseObject.length === 0) {
                        break
                    }
                    if (options.responseDataKey !== undefined) {
                        let responseKey = responseObject[options.responseDataKey]
                        if (responseKey.length === 0) {
                            break;
                        }
                    }
                    if (options.offset !== undefined && options.limit !== undefined) {
                        options.offset += options.limit
                    }
                }
            }
            return response;

        } catch (error) {
            throw new Error(`none of the conditions in the paginateRequest function were satisfied `)
        }
    }

    /**
     * @description make request by deciding if you want to include pagination or without paginating the request
     */
    private async httpRequest<T>(method: RequestMethods, url: string, options?: { queryParams?: { [key: string]: T | any }, requestData?: { [key: string]: T }, authoriaztionRequired?: boolean, isMultiPart?: boolean, multipartObject?: { [key: string]: any }, pagePagination?: boolean, limitOffsetPagination?: boolean, pageNumber?: number, limit?: number, offset?: number, paginateRequest?: boolean }) {
        let response: APIResponse | undefined
        if (options?.paginateRequest) {
            response = await this.paginateRequest(method, url, { queryParams: options?.queryParams, requestData: options?.requestData, authoriaztionRequired: options?.authoriaztionRequired, offset: options.offset, limit: options.limit, pagePagination: options.pagePagination, limitOffsetPagination: options.limitOffsetPagination })
        } else {
            response = await this.makeRequest(method, url, { queryParams: options?.queryParams, requestData: options?.requestData, authoriaztionRequired: options?.authoriaztionRequired, isMultiPart: options?.isMultiPart, multipartObject: options?.multipartObject })
        }
        return response;
    }

    public async get<T>(url: string, options?: { queryParams?: { [key: string]: T | any }, paginate?: boolean, limit?: number, offset?: number, pagePagination?: boolean, limitOffsetPagination?: boolean }) {
        let response = await this.httpRequest(RequestMethods.GET, url, { requestData: options?.queryParams, paginateRequest: options?.paginate, limit: options?.limit, offset: options?.offset, pagePagination: options?.pagePagination, limitOffsetPagination: options?.limitOffsetPagination })
        return response;
    }

    public async post<T>(url: string, data: { [key: string]: T }, options?: { isMultiPart?: boolean, multiPartData?: { [key: string]: T }, paginate?: boolean, limit?: number, offset?: number, pagePagination?: boolean, limitOffsetPagination?: boolean }) {
        let response = await this.httpRequest(RequestMethods.POST, url, { isMultiPart: options?.isMultiPart, requestData: data, multipartObject: options?.multiPartData, paginateRequest: options?.paginate, limit: options?.limit, offset: options?.offset, pagePagination: options?.pagePagination, limitOffsetPagination: options?.limitOffsetPagination })
        return response;
    }

    public async put<T>(url: string, data: { [key: string]: T }, options?: { paginate?: boolean, limit?: number, offset?: number, pagePagination?: boolean, limitOffsetPagination?: boolean }) {
        let response = await this.httpRequest(RequestMethods.PUT, url, { requestData: data, paginateRequest: options?.paginate, limit: options?.limit, offset: options?.offset, pagePagination: options?.pagePagination, limitOffsetPagination: options?.limitOffsetPagination });
        return response;
    }

    public async patch<T>(url: string, data?: { [key: string]: T }, options?: { paginate?: boolean, limit?: number, offset?: number, pagePagination?: boolean, limitOffsetPagination?: boolean }) {
        let response = await this.httpRequest(RequestMethods.PATCH, url, { requestData: data, paginateRequest: options?.paginate, limit: options?.limit, offset: options?.offset, pagePagination: options?.pagePagination, limitOffsetPagination: options?.limitOffsetPagination });
        return response;
    }

    public async delete<T>(url: string, options?: { paginate?: boolean, limit?: number, offset?: number, pagePagination?: boolean, limitOffsetPagination?: boolean }) {
        let response = await this.httpRequest(RequestMethods.DELETE, url, { paginateRequest: options?.paginate, limit: options?.limit, offset: options?.offset, pagePagination: options?.pagePagination, limitOffsetPagination: options?.limitOffsetPagination });
        return response;
    }
}