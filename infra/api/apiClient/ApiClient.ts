import { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiOptionalParams, PaginationType, RequestMethod } from '@api-helpers';
export class ApiClient {
    private baseUrl: string;

    constructor(public request: APIRequestContext, baseUrl: string) {
        this.request = request;
        this.baseUrl = baseUrl;
    }

    public async get<T>(endpoint: string, options: ApiOptionalParams<T> = {}) {
        let response = await this.makeRequest(RequestMethod.GET, endpoint, options)
        return response;
    }

    public async post<T>(endpoint: string, options: ApiOptionalParams<T> = {}) {
        let response = await this.makeRequest(RequestMethod.POST, endpoint, options)
        return response;
    }

    public async put<T>(endpoint: string, options: ApiOptionalParams<T> = {}) {
        let response = await this.makeRequest(RequestMethod.PUT, endpoint, options)
        return response;
    }

    public async patch<T>(endpoint: string, options: ApiOptionalParams<T> = {}) {
        let response = await this.makeRequest(RequestMethod.PATCH, endpoint, options)
        return response;
    }

    public async delete<T>(endpoint: string, options: ApiOptionalParams<T> = {}) {
        let response = await this.makeRequest(RequestMethod.DELETE, endpoint, options)
        return response;
    }

    public async paginateRequest<T>(
        method: RequestMethod,
        endPoint: string,
        paginationType: PaginationType,
        options: ApiOptionalParams<T>
    ) {
        try {
            let response = await this.paginateBy(method, `${this.baseUrl}/${endPoint}`, paginationType, options);
            return response;
        } catch (error) {
            throw new Error(`an error occurred in the paginate request function: ${error}`)
        }
    }

    /**
     * @description this functions provides a generic encapsulated HTTP methods with variety of options depends on your individual request
     * @param method 
     * @param url 
     * @param options 
     * @returns 
     */
    private async makeRequest<T>(
        method: RequestMethod,
        endpoint: string,
        options: ApiOptionalParams<T> = {}
    ): Promise<APIResponse | undefined> {
        let response: APIResponse | undefined
        let headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
        if (options.isMultiPart) {
            headers["Content-Type"] = 'multipart/form-data'
        }
        if (options.isAuthorizationRequired && method !== RequestMethod.GET) {
            await this.addAuthorizationHeader(headers)
        }
        switch (method.valueOf()) {
            case 'GET':
                response = await this.request.get(`${this.baseUrl}/${endpoint}`, { headers, params: options.queryParams })
                break;
            case 'POST':
                response = await this.request.post(`${this.baseUrl}/${endpoint}`, { headers, data: options.requestData, multipart: options.multiPartData })
                break;
            case 'PUT':
                response = await this.request.put(`${this.baseUrl}/${endpoint}`, { headers, data: options.requestData, multipart: options.multiPartData })
                break;
            case 'PATCH':
                response = await this.request.patch(`${this.baseUrl}/${endpoint}`, { headers, data: options.requestData, multipart: options.multiPartData })
                break;
            case 'DELETE':
                response = await this.request.delete(`${this.baseUrl}/${endpoint}`)
                break;
        }
        return response;
    }

    /**
     * @description reusable code to add the authorization header if an  authorization is required to make the request
     * @param headers 
     */
    private async addAuthorizationHeader(headers: { [key: string]: string }) {
        headers['Authorization'] = `Bearer ${process.env.API_TOKEN}`;
    }

    private async paginateBy<T>(
        method: RequestMethod,
        endPoint: string,
        paginationType: PaginationType,
        options: ApiOptionalParams<T> = {}
    ) {
        let response: APIResponse | undefined;
        let responses: APIResponse[] = [];
        while (true) {
            await this.updatePaginationQueryParams(paginationType, options);
            response = await this.makeRequest(method, endPoint, options);
            let responseObj = await response?.json();
            if (!responseObj || responseObj.length === 0) {
                break;
            }
            if (options?.responseKey) {
                let responseKey = responseObj[options.responseKey];
                if (responseKey.length === 0) {
                    break;
                }
                await this.handleResponseObject(responses, responseKey);
            } else {
                await this.handleResponseObject(responses, responseObj);
            }
            await this.updatePaginationOptions(paginationType, options);
        }

        return responses;
    }
    /**
     * @description handle the response object by spreading it to an existing array if the response is already an array otherwise push directly
     * to the array.
     * @param responseObj 
     */
    private async handleResponseObject(responses: APIResponse[], responseObj: APIResponse) {
        if (Array.isArray(responseObj)) {
            responses.push(...responseObj)
        } else {
            responses.push(responseObj);
        }
    }

    private async updatePaginationQueryParams<T>(paginationType: PaginationType, options: ApiOptionalParams<T> = {}) {
        if (paginationType === PaginationType.PAGE_PAGINATION && options.pageNumber !== undefined) {
            options.queryParams = { ...options.queryParams, 'page': options.pageNumber }
        } else if (paginationType === PaginationType.OFFSET_PAGINATION && options.limit !== undefined && options.offset !== undefined) {
            options.queryParams = { ...options.queryParams, 'limit': options.limit, 'offset': options.offset }
        }
    }

    /**
     * @description update the pagination options based on the pagination type - page or offset pagination at the moment
     * @param paginationType 
     * @param options 
     */
    private async updatePaginationOptions<T>(paginationType: PaginationType, options: ApiOptionalParams<T> = {}) {
        if (paginationType === PaginationType.PAGE_PAGINATION && options.pageNumber !== undefined) {
            options.pageNumber++;
        } else if (paginationType === PaginationType.OFFSET_PAGINATION && options.limit !== undefined && options.offset !== undefined) {
            options.offset += options.limit;
        }
    }
}