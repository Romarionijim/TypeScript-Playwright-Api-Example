import { expect, test } from '@playwright/test'
import { PokemonApi } from '../../../infra/api/entities/pokemon/PokemonApi'
import { StatusCode } from '../../../infra/api/apiRequests/ApiRequests'
import { tr } from '@faker-js/faker'

test.describe('Pokemon API CRUD tests', async () => {
    let pokemonApi: PokemonApi
    let limit: number = 100;
    let offset: number = 0
    let TRUE: boolean = true;

    test.beforeEach(async ({ request }) => {
        pokemonApi = new PokemonApi(request);
    })

    test('GET the pokemon resources', async () => {
        await test.step('GET first 20 pokemon resources by default and validate initial response', async () => {
            let res = await pokemonApi.getPokemon();
            let jsonResponse = await res?.json()
            expect(res?.status()).toBe(StatusCode.OK)
            expect(jsonResponse).toEqual(expect.objectContaining({
                count: 1292,
                next: "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
                previous: null,
                results: expect.any(Array)
            }))
            expect(jsonResponse['results'].length).toBe(20)
        })
    })

    test('get all pokemon resources', async () => {
        await test.step('get all pokemon recourses via limit and offset pagination', async () => {
            let response = await pokemonApi.getAllPokemonRecourses(limit, offset, { limitOffset: TRUE });
            let responseJson = await response?.json();

        })
    })
})