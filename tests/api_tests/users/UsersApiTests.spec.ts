import { expect } from '@playwright/test';
import { test } from '@api-helpers';
import { Users } from '@api-entities';
import { StatusCode, TestTags } from '@api-helpers';

test.describe('Api tests for GoRestApi endpoints', async () => {

    test('sanity check - [GET] /users', { tag: [TestTags.Users] }, async ({ usersApi }) => {
        await test.step('get users endpoint - validate status, body type of object properties and default length of the response', async () => {
            let response = await usersApi.getUsers();
            expect(response?.status()).toBe(StatusCode.OK)
            expect(response?.body()).toBeTruthy()
            let actualObjectProperties = await usersApi.getTypeOfUserProperties()
            let expectedObjectProperties = new Array(actualObjectProperties.length).fill(['number', 'string', 'string', 'string', 'string'])
            expect(actualObjectProperties).toEqual(expectedObjectProperties)
        })
    })

    /**
     * @description there is a bug with this endpoint - it does not authorize any generated toke=n whatsoever
     */
    test('gender equality - [POST] /users', { tag: [TestTags.Users] }, async ({ usersApi }) => {
        await test.step('make an api request to make both male and female genders equal', async () => {
            await usersApi.makeBothGendersEven();
            let maleGender = await usersApi.getGenderCount('male')
            let femaleGender = await usersApi.getGenderCount('female')
            expect(maleGender).toEqual(femaleGender)
        })
    })

    test('replace email extension of users - [PATCH] /users/:userId', { tag: [TestTags.Users] }, async ({ usersApi }) => {
        await test.step('extract extension of each user email and replace each extension with co.il', async () => {
            let response = await usersApi.replaceEmailExtensionForUsers()
            expect(response?.status()).toBe(StatusCode.OK)
        })
        await test.step('validate previous extensions were replaced with co.il extension', async () => {
            let actualEmailExtensions = await usersApi.getCurrentUserEmailExtension()
            let expectedExtensions = new Array(actualEmailExtensions.length).fill('.co.il')
            expect(actualEmailExtensions).toEqual(expectedExtensions)
        })
    })

    test('delete inactive users - [DELETE] /users/:userId', { tag: [TestTags.Users] }, async ({ usersApi }) => {
        await test.step('make a request to delete all users that have an inactive status', async () => {
            let response = await usersApi.deleteInactiveUsers()
            expect(response?.status()).toBe(StatusCode.UNAUTHORIZED)
            let actualInactiveUsers = await usersApi.getInActiveUsers()
            let expectedInactiveUsersLength = actualInactiveUsers.length
            expect(expectedInactiveUsersLength).toBe(0)
        })
    })
})