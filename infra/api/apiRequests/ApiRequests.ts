import { APIRequestContext, APIResponse, expect } from "@playwright/test";

export enum RequestMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
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
     * @description this functions provides a genneric encapsulated HTTP methods with variety of options depends on your individual request
     * @param method 
     * @param url 
     * @param options 
     * @returns 
     */
    private async makeRequest<T>(method: RequestMethods, url: string, options?: { queryParams?: { [key: string]: T | any }, requestData?: { [key: string]: T }, authoriaztionRequired?: boolean, multiPartFormData?: boolean, multipartObject?: { [key: string]: string } }): Promise<APIResponse | undefined> {
        let response: APIResponse | undefined
        let headers: Record<string, string> = {
            'Accept': '*/*'
        }
        if (options?.multiPartFormData) {
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
                response = await this.apiRequestContext.post(url, { headers, data: options?.requestData, multipart: options?.multipartObject })
                break;
            case RequestMethods.PUT:
                response = await this.apiRequestContext.put(url, { headers, data: options?.requestData, multipart: options?.multipartObject })
                break;
            case RequestMethods.PATCH:
                response = await this.apiRequestContext.patch(url, { headers, data: options?.requestData, multipart: options?.multipartObject })
                break;
            case RequestMethods.DELETE:
                response = await this.apiRequestContext.delete(url)
                break;
        }
        return response
    }

    public async get<T>(url: string, queryParams?: { [key: string]: T | any }) {
        let response = await this.makeRequest(RequestMethods.GET, url, { requestData: queryParams })
        return response;
    }

    public async post<T>(url: string, data?: { [key: string]: T }) {
        let response = await this.makeRequest(RequestMethods.POST, url, { requestData: data })
        return response;
    }

    public async put<T>(url: string, data?: { [key: string]: T }) {
        let response = await this.makeRequest(RequestMethods.PUT, url, { requestData: data });
        return response;
    }

    public async patch<T>(url: string, data?: { [key: string]: T }) {
        let response = await this.makeRequest(RequestMethods.PATCH, url, { requestData: data });
        return response;
    }

    public async delete<T>(url: string) {
        let response = await this.makeRequest(RequestMethods.DELETE, url);
        return response;
    }
}