import { APIRequestContext, APIResponse } from "@playwright/test";
import { ApiClient } from "../../apiClient/ApiClient";
import { ApiEndpoints } from "../../endpoints/ApiEndpoints";
import { ApplicationUrl } from "../../helpers/urls/ApplicationUrl";
import path from "path";
import Randomizer from "../../helpers/faker/Randomizer";
import fs from 'fs'

export class PetStoreCrudActions extends ApiClient {

    private petStorePetEndpoint = `${ApplicationUrl.PET_STORE_URL}/${ApiEndpoints.PET}`

    public async getPet(petId: number): Promise<APIResponse | undefined> {
        let response = await this.get(`${this.petStorePetEndpoint}/${petId}`)
        return response;
    }

    public async createNewPet<T>(petData: { [key: string]: T }) {
        let response = await this.post(this.petStorePetEndpoint, { requestData: petData })
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
        let response = await this.post(`${this.petStorePetEndpoint}/${petId}/${ApiEndpoints.UPLOAD_IMAGE}`, { isMultiPart: true, multiPartData })
        return response;
    }

    public async updatePet<T>(updatedData: { [key: string]: T }) {
        let response = await this.put(this.petStorePetEndpoint, { requestData: updatedData })
        return response;
    }

    public async deletePet(petId: number) {
        let response = await this.delete(`${this.petStorePetEndpoint}/${petId}`)
        return response;
    }
}