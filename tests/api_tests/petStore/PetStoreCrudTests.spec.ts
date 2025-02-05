import { expect, test } from '@playwright/test'
import { PetStoreApi } from '@api-entities'
import MockDataGenerator, { IPet, StatusCode, TestTags } from '@api-helpers';

test.describe.serial('CRUD API tests for the Pet Store API', async () => {
    let petStoreCrudActions: PetStoreApi;
    let id: number = 10;
    let petId: number = 3193;

    test.beforeEach(async ({ request }) => {
        petStoreCrudActions = new PetStoreApi(request)
    })

    test('get a specific pet for sanity checkup - [GET] /pet/:petId', { tag: [TestTags.PET_STORE] }, async () => {
        await test.step('make an api request to a specific pet ID', async () => {
            let response = await petStoreCrudActions.getPet(id)
            let responseJson: IPet = await response?.json()
            expect(response?.status()).toBe(StatusCode.OK)
            expect(responseJson.name).toBe('doggie')
        })
    })

    test('create a new pet - [POST] /pet', { tag: [TestTags.PET_STORE] }, async () => {
        await test.step('create a new pet via post request', async () => {
            let petData = {
                id: petId,
                category: {
                    id: MockDataGenerator.getRandomLongNumber(),
                    name: MockDataGenerator.getRandomName()
                },
                name: 'Pikachu',
                photoUrls: ['https://ibb.co/wLWCrSX'],
                tags: [
                    {
                        id: MockDataGenerator.getRandomLongNumber(),
                        name: MockDataGenerator.getRandomName(),
                    }
                ],
                status: 'available'
            }
            let response = await petStoreCrudActions.createNewPet(petData)
            let responseBody: IPet = await response?.json();
            expect(response?.status()).toBe(StatusCode.OK);
            expect(responseBody).toEqual(petData);
            expect(response?.statusText()).toBe('OK');
        })
    })

    test('validate pet exists - [GET] /pet/:petId', { tag: [TestTags.PET_STORE] }, async () => {
        await test.step('validate the pet that was created from previous test now exists', async () => {
            let response = await petStoreCrudActions.getPet(petId)
            let responseBody: IPet = await response?.json();
            expect(response).toBeTruthy()
            expect(response?.status()).toBe(StatusCode.OK)
            expect(responseBody.id).toEqual(petId)
            expect(responseBody.name).toEqual('Pikachu')
        })
    })

    test.skip('create pet image - [POST] /pet/:petId', { tag: [TestTags.PET_STORE] }, async () => {
        await test.step('upload another image to the pet that was created in the previous test', async () => {
            let imageFileName: string = 'pug.png'
            let response = await petStoreCrudActions.uploadPetImage(petId, imageFileName);
            expect(response?.status()).toBe(StatusCode.OK);
        })
    })

    test('update pet - [PATCH] /pet/:petId', { tag: [TestTags.PET_STORE] }, async () => {
        await test.step('update the newly created pet that was created in previous test', async () => {
            let petData = {
                id: petId,
                category: {
                    id: MockDataGenerator.getRandomLongNumber(),
                    name: MockDataGenerator.getRandomName()
                },
                name: 'Pokey',
                photoUrls: ['https://ibb.co/0Z9v02Z'],
                tags: [
                    {
                        id: MockDataGenerator.getRandomLongNumber(),
                        name: MockDataGenerator.getRandomName(),
                    }
                ],
                status: 'available'
            }
            let response = await petStoreCrudActions.updatePet(petId, petData)
            let responseBody: IPet = await response?.json();
            expect(response?.status()).toBe(StatusCode.OK)
            expect(responseBody.name).toEqual('Pokey');
        })
    })

    test('delete pet - [DELETE] /pet/:petId', { tag: [TestTags.PET_STORE] }, async () => {
        await test.step('delete the pet that was created and updated in previous tests', async () => {
            let response = await petStoreCrudActions.deletePet(petId)
            expect(response?.status()).toBe(StatusCode.OK)
        })

        await test.step('retrieve the deleted pet and validate it does not exist by validating response returns 404', async () => {
            let deletedPet = await petStoreCrudActions.getPet(petId)
            expect(deletedPet?.status()).toBe(StatusCode.NOT_FOUND);
        })
    })
})