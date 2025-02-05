import { PetStoreApi, PokemonApi, Users } from '@api-entities';
import { test as base } from '@playwright/test';
import { ApplicationUrl } from '../urls/ApplicationUrl';

type ApiEntities = {
  petStoreApi: PetStoreApi;
  usersApi: Users;
  pokemonApi: PokemonApi;
  baseUrl: ApplicationUrl;
}

export const test = base.extend<ApiEntities>({
  petStoreApi: async ({ request }, use) => {
    await use(new PetStoreApi(request, ApplicationUrl.PET_STORE_URL));
  },

  usersApi: async ({ request }, use) => {
    await use(new Users(request, ApplicationUrl.GO_REST_API));
  },

  pokemonApi: async ({ request }, use) => {
    await use(new PokemonApi(request, ApplicationUrl.POKEMON_URL));
  }
});
