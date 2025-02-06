import { APIResponse } from "@playwright/test";
import { ApiClient } from "@api-client";
import { ApiEndpoints } from "@api-endpoints";
import { ApplicationUrl } from "@api-helpers";
import path from "path";
import fs from 'fs'

export class PetStoreApi extends ApiClient {
    private petStorePetEndpoint = `${ApplicationUrl.PET_STORE_URL}/${ApiEndpoints.PET}`

    async getPet(petId: number): Promise<APIResponse | undefined> {
        let response = await this.get(`${this.petStorePetEndpoint}/${petId}`)
        return response;
    }

    async createNewPet<T>(petData: { [key: string]: T }) {
        let response = await this.post(this.petStorePetEndpoint, { requestData: petData })
        return response;
    }

    /**
     * @description this function uploads a pet image via reading a file and uploading it as a buffer file using the playwright multipart photo upload
     */
    async uploadPetImage<T>(petId: number, fileName: string) {
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
        let response = await this.post(`${this.petStorePetEndpoint}/${petId}/${ApiEndpoints.UPLOAD_IMAGE}`, { isMultiPart: true, multiPartData })
        return response;
    }

    async updatePet<T>(updatedData: { [key: string]: T }) {
        let response = await this.put(this.petStorePetEndpoint, { requestData: updatedData })
        return response;
    }

    async deletePet(petId: number) {
        let response = await this.delete(`${this.petStorePetEndpoint}/${petId}`)
        return response;
    }
}