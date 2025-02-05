import { expect } from '@playwright/test';
import { test } from '@api-helpers';
import { PokemonApi } from '@api-entities';
import { StatusCode } from '@api-helpers';
import { TestTags } from '@api-helpers';

test.describe('Pokemon API CRUD tests', async () => {
    let limit: number = 100;
    let offset: number = 0

    test('GET the pokemon resources - [GET] /pokemon', { tag: [TestTags.POKEMON_API] }, async ({ pokemonApi }) => {
        await test.step('GET first 20 pokemon resources by default and validate initial response', async () => {
            let res = await pokemonApi.getPokemon();
            let jsonResponse = await res?.json()
            expect(res?.status()).toBe(StatusCode.OK)
            expect(jsonResponse).toEqual(expect.objectContaining({
                count: 1304,
                next: "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
                previous: null,
                results: expect.any(Array)
            }))
            expect(jsonResponse['results'].length).toBe(20)
        })
    })

    test('get all pokemon resources pagination - [GET] /pokemon', { tag: [TestTags.POKEMON_API] }, async ({ pokemonApi }) => {
        await test.step('get all pokemon recourses via limit and offset pagination', async () => {
            let response = await pokemonApi.getAllPokemonRecourses(limit, offset)
            let responseLength = response?.length
            expect(responseLength).toBe(1304)
        })
    })

    test('response keys type validation - [GET] /pokemon', { tag: [TestTags.POKEMON_API] }, async ({ pokemonApi }) => {
        await test.step('validate that each key in the results response object are equals to strings', async () => {
            let res = await pokemonApi.getPokemon()
            let resJson = await res?.json()
            let results = resJson['results']
            let resultsNameType = results.every((el: { [key: string]: any }) => typeof el['name'] === 'string')
            let resultsUrlType = results.every((el: { [key: string]: any }) => typeof el['url'] === 'string')
            expect(resultsNameType).toBe(true)
            expect(resultsUrlType).toBe(true)
        })
    })
})