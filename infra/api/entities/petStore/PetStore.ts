import { APIRequestContext, APIResponse } from "@playwright/test";
import { ApiClient } from "@api-client";
import { ApiEndpoints } from "@api-endpoints";
import { ApplicationUrl } from "@api-helpers";
import path from "path";
import fs from 'fs'

export class PetStoreApi extends ApiClient {

    constructor(request: APIRequestContext, baseUrl = ApplicationUrl.PET_STORE_URL) {
        super(request, baseUrl)
    }
    
    public async getPet(petId: number): Promise<APIResponse | undefined> {
        let response = await this.get(`${ApiEndpoints.PET}/${petId}`)
        return response;
    }

    public async createNewPet<T>(petData: { [key: string]: T }) {
        let response = await this.post(`${ApiEndpoints.PET}`, { requestData: petData })
        return response;
    }

    /**
     * @description this function uploads a pet image via reading a file and uploading it as a buffer file using the playwright multipart photo upload
     */
    public async uploadPetImage<T>(petId: number, fileName: string) {
        const rootDir = '.'
        const file = path.resolve(rootDir, fileName);
        const image = fs.readFileSync(file);
        const multiPartData = {
            file: {
                name: file,
                mimeType: "image/png",
                buffer: image,
            },
        }
        let response = await this.post(`${ApiEndpoints.PET}/${petId}/${ApiEndpoints.UPLOAD_IMAGE}`, { isMultiPart: true, multiPartData })
        return response;
    }

    public async updatePet<T>(petId: number, updatedData: { [key: string]: T }) {
        let response = await this.put(`${ApiEndpoints.PET}/${petId}`, { requestData: updatedData })
        return response;
    }

    public async deletePet(petId: number) {
        let response = await this.delete(`${ApiEndpoints.PET}/${petId}`)
        return response;
    }
}