import { APIRequestContext, APIResponse, expect } from "@playwright/test";
import { ApiClient, PaginationType, RequestMethod, StatusCode } from "../../apiClient/ApiClient";
import { ApplicationUrl } from "../../helpers/urls/ApplicationUrl";
import { ApiEndpoints } from "../../endpoints/ApiEndpoints";

export class PokemonApi extends ApiClient {
    private POKEMON_BASE_URL = ApplicationUrl.POKEMON_URL;
    private POKEMON_ENDPOINT = `${this.POKEMON_BASE_URL}/${ApiEndpoints.POKEMON}`;

    public async getPokemon() {
        let response = await this.makeApiRequest(RequestMethod.GET, this.POKEMON_ENDPOINT)
        return response as APIResponse;
    }

    /**
     * @description get all pokemon recourses by using pagination - you can choose via page or limit and offset pagination mechanism
     */
    public async getAllPokemonRecourses(limit: number, offset: number) {
        let responses = await this.makeApiRequest(RequestMethod.GET, this.POKEMON_ENDPOINT, { paginateRequest: true, limitOffsetPagination: true, paginationType: PaginationType.OFFSET_PAGINATION, limit: limit, offset: offset, responseKey: 'results' })
        return responses as APIResponse[];
    }
}