import { ApiRequests } from "../../apiRequests/ApiRequests";
import { ApplicationUrl } from "../../helpers/urls/ApplicationUrl";

export class PokemonApi extends ApiRequests {
    private POKEMON_BASE_URL = ApplicationUrl.POKEMON_URL;
    private POKEMON_ENDPOINT = `${this.POKEMON_BASE_URL}/pokemon`;

    public async getPokemon() {
        let response = await this.get(this.POKEMON_ENDPOINT)
        return response;
    }

    /**
     * @description get all pokemon recourses by using pagination - you can choose via page or limit and offset pagination mechanism
     */
    public async getAllPokemonRecourses(limit: number, offset: number, paginationMechanism?: { page?: boolean, limitOffset?: boolean }) {
        let response = await this.get(this.POKEMON_ENDPOINT, { paginate: true, limitOffsetPagination: paginationMechanism?.limitOffset, pagePagination: paginationMechanism?.page, limit, offset })
        return response;
    }
}