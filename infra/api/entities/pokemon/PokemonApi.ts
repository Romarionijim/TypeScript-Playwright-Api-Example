import { ApiClient } from "@api-client";
import { ApplicationUrl } from "@api-helpers";
import { ApiEndpoints } from "@api-endpoints";
import { RequestMethod, PaginationType } from "@api-helpers";

export class PokemonApi extends ApiClient {
    private POKEMON_BASE_URL = ApplicationUrl.POKEMON_URL;
    private POKEMON_ENDPOINT = `${this.POKEMON_BASE_URL}/${ApiEndpoints.POKEMON}`;

    public async getPokemon() {
        let response = await this.get(this.POKEMON_ENDPOINT)
        return response;
    }

    /**
     * @description get all pokemon recourses by using pagination - you can choose via page or limit and offset pagination mechanism
     */
    public async getAllPokemonRecourses(limit: number, offset: number) {
        let responses = await this.paginateRequest(
            RequestMethod.GET,
            this.POKEMON_ENDPOINT,
            PaginationType.OFFSET_PAGINATION,
            {
                limit,
                offset,
                responseKey: 'results'
            }
        )
        return responses;
    }
}