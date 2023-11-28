import { APIRequestContext } from "@playwright/test";
import { ApiRequests } from "../../apiRequests/ApiRequests";
import { ApiEndpoints } from "../../endpoints/ApiEndpoints";
import { ApplicationUrl } from "../../helpers/urls/ApplicationUrl";

export class PetStoreCrudActions extends ApiRequests {
    private petStorePetEndpoint = `${ApplicationUrl.PET_STORE_URL}/${ApiEndpoints.PET_STORE_ENDPOINT}`

    public async getPet(petId: number) {
        let response = await this.get(`${this.petStorePetEndpoint}/${petId}`)
        return response;
    }
}