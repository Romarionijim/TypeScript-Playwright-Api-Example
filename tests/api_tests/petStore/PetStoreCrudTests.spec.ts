import { expect, test } from '@playwright/test'
import { PetStoreCrudActions } from '../../../infra/api/entities/petStore/PetStoreCrudActions'
import { STATUS_CODES } from 'http';
import { StatusCode } from '../../../infra/api/apiRequests/ApiRequests';
import { Ipet } from '../../../infra/api/interfaces/ApiObjectsInterfaces';
import Randomizer from '../../../infra/api/helpers/faker/Randomizer';

test.describe('CRUD API tests for the Pet Store API', async () => {
    let petStoreCrudActions: PetStoreCrudActions;
    let petId: number = 10;
    let createdPedtId: number = 3193;


    test.beforeEach(async ({ request }) => {
        petStoreCrudActions = new PetStoreCrudActions(request)
    })

    test('get a specific pet for sanity checkup @PET_STORE', async () => {
        await test.step('make an api request to a specific pet ID', async () => {
            let response = await petStoreCrudActions.getPet(petId)
            let responseJson: Ipet = await response?.json()
            expect(response?.status()).toBe(StatusCode.OK)
            expect(responseJson.name).toBe('doggie')
        })
    })

    test('create a new pet @PET_STORE', async () => {
        await test.step('create a new pet via post request', async () => {
            let petData = {
                id: Randomizer.getRandomLongNumber(),
                category: {
                    id: Randomizer.getRandomLongNumber(),
                    name: Randomizer.getRandomName()
                },
                name: Randomizer.getDogNameBreed(),
                photoUrls: ['https://ibb.co/wLWCrSX'],
                tags: [
                    {
                        id: Randomizer.getRandomLongNumber(),
                        name: Randomizer.getRandomName(),
                    }
                ],
                status: 'available'
            }
            let response = await petStoreCrudActions.createNewPet(petData)
            let responseBody: Ipet = await response?.json();
            expect(response?.status()).toBe(StatusCode.OK);
            expect(responseBody).toEqual(petData);
            expect(response?.statusText()).toBe('OK');
        })
    })

    test('validate the pet existance', async () => {
        await test.step('validate the pet that was created from previous test now exists', async () => {
            let response = await petStoreCrudActions.getPet(createdPedtId)
            let responseBody: Ipet = await response?.json();
            expect(response).toBeTruthy()
            expect(response?.status()).toBe(StatusCode.OK)
            expect(responseBody.id).toEqual(createdPedtId)
            expect(responseBody.name).toEqual('Shiloh Shepherd')
        })
    })

    test.skip('create pet image', async () => {
        await test.step('upload another image to the pet that was created in the previous test', async () => {
            let imageFileName: string = 'pug.png'
            let response = await petStoreCrudActions.uploadPetImage(createdPedtId, imageFileName);
            expect(response?.status()).toBe(StatusCode.OK);

        })
    })

    // (property) multipart?: {
    //     [key: string]: string | number | boolean | ReadStream | {
    //         name: string;
    //         mimeType: string;
    //     };
    // } | undefined

})