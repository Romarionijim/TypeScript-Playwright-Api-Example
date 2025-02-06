import { expect } from '@playwright/test';
import { test } from '@api-helpers';
import MockDataGenerator, { IPet, StatusCode, TestTags } from '@api-helpers';
import { payloads } from '@api-helpers';

test.describe.serial('CRUD API tests for the Pet Store API', async () => {
    let id: number = 10;
    let petId: number = 3193;

    test('get a specific pet for sanity checkup - [GET] /pet/:petId', { tag: [TestTags.PET_STORE] }, async ({ petStoreApi }) => {
        await test.step('make an api request to a specific pet ID', async () => {
            let response = await petStoreApi.getPet(id)
            let responseJson: IPet = await response?.json()
            expect(response?.status()).toBe(StatusCode.OK)
            expect(responseJson.name).toBe('doggie')
        })
    })

    test('create a new pet - [POST] /pet', { tag: [TestTags.PET_STORE] }, async ({ petStoreApi }) => {
        await test.step('create a new pet via post request', async () => {
          
            let response = await petStoreApi.createNewPet(payloads.createdPet)
            let responseBody: IPet = await response?.json();
            expect(response?.status()).toBe(StatusCode.OK);
            expect(responseBody).toEqual(payloads.createdPet);
            expect(response?.statusText()).toBe('OK');
        })
    })

    test('validate pet exists - [GET] /pet/:petId', { tag: [TestTags.PET_STORE] }, async ({ petStoreApi }) => {
        await test.step('validate the pet that was created from previous test now exists', async () => {
            let response = await petStoreApi.getPet(petId)
            let responseBody: IPet = await response?.json();
            expect(response).toBeTruthy()
            expect(response?.status()).toBe(StatusCode.OK)
            expect(responseBody.id).toEqual(petId)
            expect(responseBody.name).toEqual('Pikachu')
        })
    })

    test.skip('create pet image - [POST] /pet/:petId', { tag: [TestTags.PET_STORE] }, async ({ petStoreApi }) => {
        await test.step('upload another image to the pet that was created in the previous test', async () => {
            let imageFileName: string = 'pug.png'
            let response = await petStoreApi.uploadPetImage(petId, imageFileName);
            expect(response?.status()).toBe(StatusCode.OK);
        })
    })

    test('update pet - [PATCH] /pet/:petId', { tag: [TestTags.PET_STORE] }, async ({ petStoreApi }) => {
        await test.step('update the newly created pet that was created in previous test', async () => {
            let response = await petStoreApi.updatePet(payloads.updatePet)
            let responseBody: IPet = await response?.json();
            expect(response?.status()).toBe(StatusCode.OK)
            expect(responseBody.name).toEqual('Pokey');
        })
    })

    test('delete pet - [DELETE] /pet/:petId', { tag: [TestTags.PET_STORE] }, async ({ petStoreApi }) => {
        await test.step('delete the pet that was created and updated in previous tests', async () => {
            let response = await petStoreApi.deletePet(petId)
            expect(response?.status()).toBe(StatusCode.OK)
        })

        await test.step('retrieve the deleted pet and validate it does not exist by validating response returns 404', async () => {
            let deletedPet = await petStoreApi.getPet(petId)
            expect(deletedPet?.status()).toBe(StatusCode.NOT_FOUND);
        })
    })
})