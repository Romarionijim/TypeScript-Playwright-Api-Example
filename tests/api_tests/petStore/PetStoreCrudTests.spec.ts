import { expect, test } from '@playwright/test'
import { PetStoreCrudActions } from '../../../infra/api/entities/petStore/PetStoreCrudActions'

test.describe('CRUD API tests for the Pet Store API', async () => {
    let petStoreCrudActions: PetStoreCrudActions;
    let petId: number = 10;


    test.beforeEach(async ({ request }) => {
        petStoreCrudActions = new PetStoreCrudActions(request)
    })

    test('get a specific pet resource', async () => {
        await test.step('make an api request to a specific pet ID', async () => {
            let response = await petStoreCrudActions.getPet(petId)
            let responseJson = await response?.json()
            console.log(responseJson);
            expect(response?.status()).toBe(200)
        })
    })
})