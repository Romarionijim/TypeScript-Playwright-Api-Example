import { PetStoreApi, PokemonApi, Users } from '@api-entities';
import { test as base } from '@playwright/test';

type ApiEntities = {
  petStoreApi: PetStoreApi;
  usersApi: Users;
  pokemonApi: PokemonApi;
}

export const test = base.extend<ApiEntities>({
  petStoreApi: async ({ request }, use) => {
    await use(new PetStoreApi(request));
  },

  usersApi: async ({ request }, use) => {
    await use(new Users(request));
  },

  pokemonApi: async ({ request }, use) => {
    await use(new PokemonApi(request));
  }
});
