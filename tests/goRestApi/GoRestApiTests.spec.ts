import { test, request, expect } from '@playwright/test'
import { Users } from '../../infra/api/entities/gorestapi/Users'
import { StatusCode } from '../../infra/api/apiRequests/ApiRequests';
import { IUser } from '../../infra/api/helpers/interfaces/ApiObjectsInterfaces';

test.describe('Api tests for GoRestApi endpoints', async () => {
    let users: Users;
    let pageNumber: number = 1

    test.beforeEach(async ({ request }) => {
        users = new Users(request);
    })


    test.skip('get all users', async () => {
        await test.step('get all users from all pages from users endpoint', async () => {
            let res = await users.getAllUsers(pageNumber)
            expect(res.every(res => res.status())).toBe(StatusCode.OK)
        })
    })


    test('sanity check', async () => {
        await test.step('get users endpoint - validate status, body type of obejct properties and default length of the response', async () => {
            let response = await users.getUsers();
            expect(response?.status()).toBe(StatusCode.OK)
            expect(response?.body()).toBeTruthy()
            let userObject = await users.getTypeOfUserProperies()
            expect(userObject).toEqual([
                ['number', 'string', 'string', 'string', 'string'],
                ['number', 'string', 'string', 'string', 'string'],
                ['number', 'string', 'string', 'string', 'string'],
                ['number', 'string', 'string', 'string', 'string'],
                ['number', 'string', 'string', 'string', 'string'],
                ['number', 'string', 'string', 'string', 'string'],
                ['number', 'string', 'string', 'string', 'string'],
                ['number', 'string', 'string', 'string', 'string'],
                ['number', 'string', 'string', 'string', 'string'],
                ['number', 'string', 'string', 'string', 'string']])
        })
    })

    /**
     * @description there is a bug with this endpoint - it does not authorize any generated toke=n whatsoever
     */
    test.skip('gender equality', async () => {
        await test.step('make an apir equest to make both male and female genders equal', async () => {
            let response = await users.makeBothGendersEven();
            expect(response?.status()).toBe(StatusCode.OK)
            let maleGender = await users.getMaleUsers()
            let femaleGender = await users.getFemaleUsers()
            expect(maleGender.length).toEqual(femaleGender.length)
        })
    })

    test('replace email extension of users', async () => {
        await test.step('extract extension of each user email and replace each extension with co.il', async () => {
            let response = await users.replaceEmailExtensionForUsers()
            expect(response?.status()).toBe(StatusCode.OK)
            let actualEmailExtensions = await users.getCurrentUserEmailExtension()
            let expectedExtensions = new Array(actualEmailExtensions.length).fill('co.il')
            expect(actualEmailExtensions).toEqual(expectedExtensions)
        })
    })
})