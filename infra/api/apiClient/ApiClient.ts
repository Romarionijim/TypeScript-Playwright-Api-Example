import { el } from "@faker-js/faker";
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

export interface ApiOptionalParams<T> {
    responseDataKey?: string,
    queryParams?: { [key: string]: any },
    requestData?: { [key: string]: T },
    authoriaztionRequired?: boolean,
    isMultiPart?: boolean,
    multipartObject?: { [key: string]: any },
    paginateRequest?: boolean,
    pagePagination?: boolean,
    limitOffsetPagination?: boolean,
    pageNumber?: number,
    limit?: number,
    offset?: number,
}


export class ApiClient {
    constructor(public apiRequestContext: APIRequestContext) {
        this.apiRequestContext = apiRequestContext
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
                response = await this.apiRequestContext.get(url, { headers, params: options?.queryParams })
                break;
            case 'POST':
                response = await this.apiRequestContext.post(url, { headers, data: options?.requestData, multipart: options?.multipartObject! })
                break;
            case 'PUT':
                response = await this.apiRequestContext.put(url, { headers, data: options?.requestData, multipart: options?.multipartObject! })
                break;
            case 'PATCH':
                response = await this.apiRequestContext.patch(url, { headers, data: options?.requestData, multipart: options?.multipartObject! })
                break;
            case 'DELETE':
                response = await this.apiRequestContext.delete(url)
                break;
        }
        return response
    }

    /**
     * @description function that supports pagination via page pagination or by limit and offset pagination
     */
    protected async paginateRequest<T>(method: RequestMethods, url: string, options?: ApiOptionalParams<T>) {
        let existingQueryParams = { ...options?.queryParams }
        let response: APIResponse | undefined
        let responses: APIResponse[] = []
        try {
            while (true) {
                if (options?.pagePagination && options?.pageNumber !== undefined) {
                    existingQueryParams['page'] = options.pageNumber
                    response = await this.makeRequest(method, url, { queryParams: existingQueryParams, requestData: options.requestData, authoriaztionRequired: options.authoriaztionRequired })
                    let responseObject = await response?.json()
                    if (!responseObject || responseObject.length === 0) {
                        break
                    }
                    responses.push(...responseObject)
                    options.pageNumber++
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
                        responses.push(...responseKey)
                    } else {
                        if (Array.isArray(responseObject)) {
                            responses.push(...responseObject)
                        } else {
                            responses.push(responseObject)
                        }
                    }
                    if (options.offset !== undefined && options.limit !== undefined) {
                        options.offset += options.limit
                    }
                }
            }
            return responses

        } catch (error) {
            throw new Error(`caught an error in the paginate request function: ${error}`)
        }
    }

    /**
     * @description http request that abstracts the logic behind the scenes 
     */
    private async httpRequest<T>(method: RequestMethods, url: string, options?: ApiOptionalParams<T>) {
        let response = await this.makeRequest(method, url, { queryParams: options?.queryParams, requestData: options?.requestData, authoriaztionRequired: options?.authoriaztionRequired, isMultiPart: options?.isMultiPart, multipartObject: options?.multipartObject })
        return response;
    }

    public async get<T>(url: string, options?: ApiOptionalParams<T>) {
        let response = await this.httpRequest(RequestMethods.GET, url, { requestData: options?.queryParams, paginateRequest: options?.paginateRequest, limit: options?.limit, offset: options?.offset, pagePagination: options?.pagePagination, limitOffsetPagination: options?.limitOffsetPagination, responseDataKey: options?.responseDataKey })
        return response
    }

    public async post<T>(url: string, data: { [key: string]: T }, options?: ApiOptionalParams<T>) {
        let response = await this.httpRequest(RequestMethods.POST, url, { isMultiPart: options?.isMultiPart, requestData: data, multipartObject: options?.multipartObject, paginateRequest: options?.paginateRequest, limit: options?.limit, offset: options?.offset, pagePagination: options?.pagePagination, limitOffsetPagination: options?.limitOffsetPagination, authoriaztionRequired: options?.authoriaztionRequired })
        return response
    }

    public async put<T>(url: string, data: { [key: string]: T }, options?: ApiOptionalParams<T>) {
        let response = await this.httpRequest(RequestMethods.PUT, url, { requestData: data, paginateRequest: options?.paginateRequest, limit: options?.limit, offset: options?.offset, pagePagination: options?.pagePagination, limitOffsetPagination: options?.limitOffsetPagination, authoriaztionRequired: options?.authoriaztionRequired });
        return response
    }

    public async patch<T>(url: string, data?: { [key: string]: T }, options?: ApiOptionalParams<T>) {
        let response = await this.httpRequest(RequestMethods.PATCH, url, { requestData: data, paginateRequest: options?.paginateRequest, limit: options?.limit, offset: options?.offset, pagePagination: options?.pagePagination, limitOffsetPagination: options?.limitOffsetPagination, authoriaztionRequired: options?.authoriaztionRequired });
        return response;
    }

    public async delete<T>(url: string, options?: ApiOptionalParams<T>) {
        let response = await this.httpRequest(RequestMethods.DELETE, url, { paginateRequest: options?.paginateRequest, limit: options?.limit, offset: options?.offset, pagePagination: options?.pagePagination, limitOffsetPagination: options?.limitOffsetPagination, authoriaztionRequired: options?.authoriaztionRequired });
        return response;
    }
}