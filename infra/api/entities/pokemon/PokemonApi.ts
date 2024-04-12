import { APIRequestContext, APIResponse, expect } from "@playwright/test";
import { ApiClient, PaginationType, RequestMethod, StatusCode } from "../../apiClient/ApiClient";
import { ApplicationUrl } from "../../helpers/urls/ApplicationUrl";

export class PokemonApi extends ApiClient {
    private POKEMON_BASE_URL = ApplicationUrl.POKEMON_URL;
    private POKEMON_ENDPOINT = `${this.POKEMON_BASE_URL}/pokemon`;

    public async getPokemon() {
        let response = await this.get(this.POKEMON_ENDPOINT)
        return response;
    }

    /**
     * @description get all pokemon recourses by using pagination - you can choose via page or limit and offset pagination mechanism
     */
    public async getAllPokemonRecourses(limit: number, offset: number) {
        let responses = await this.paginateRequest(RequestMethod.GET, this.POKEMON_ENDPOINT, PaginationType.OFFSET_PAGINATION, { limitOffsetPagination: true, limit: limit, offset: offset, responseKey: 'results' })
        return responses;
    }
}