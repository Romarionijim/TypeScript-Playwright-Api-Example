import { APIResponse } from "@playwright/test";
import { ApiClient } from "@api-client";
import MockDataGenerator, { ApplicationUrl, RequestMethod, PaginationType, payloads } from "@api-helpers";
import { ApiEndpoints } from "@api-endpoints";

export class Users extends ApiClient {
    private usersEndpoint = `${ApplicationUrl.GO_REST_API}/${ApiEndpoints.USERS_ENDPOINT}`

    async getUsers() {
        let response = await this.get(this.usersEndpoint)
        return response;
    }

    async getGenderCount(gender: string) {
        let response = await this.get(this.usersEndpoint)
        let responseObject = await response?.json()
        let genderFilter = responseObject.filter((el: { gender: string; }) => el.gender === gender).length
        return genderFilter
    }

    /**
     * @description make both genders even for the first default 10 records without pagination
     * @returns 
     */
    async makeBothGendersEven() {
        let response: APIResponse | undefined
        let maleUsers = await this.getGenderCount('male');
        let femaleUsers = await this.getGenderCount('female');
        try {
            let difference = Math.abs(maleUsers - femaleUsers)
            if (maleUsers === femaleUsers) {
                return;
            } else if (maleUsers > femaleUsers) {
                for (let i = 0; i < difference; i++) {
                    response = await this.post(this.usersEndpoint, { requestData: payloads.femaleData, isAuthorizationRequired: true })
                }
            } else {
                for (let i = 0; i < difference; i++) {
                    response = await this.post(this.usersEndpoint, { requestData: payloads.maleData, isAuthorizationRequired: true })
                }
            }
            return response;
        } catch (error) {
            throw new Error(`an error occurred in makeBothGendersEven function: ${error}`)
        }
    }

    async getInactiveUsers() {
        let response = await this.getUserStatus('inactive')
        return response
    }

    async deleteInactiveUsers() {
        let response: APIResponse | undefined
        let inActiveUsers = await this.getInactiveUsers()
        for (let user of inActiveUsers) {
            response = await this.delete(`${this.usersEndpoint}/${user.id}`, { isAuthorizationRequired: true })
        }
        return response;
    }

    /**
     * @description get all of the users using page pagination
     * @returns 
     */
    async getAllUsers(page: number) {
        let response = await this.paginateRequest(
            RequestMethod.GET,
            this.usersEndpoint,
            PaginationType.PAGE_PAGINATION,
            {
                pageNumber: page
            }
        )
        return response;
    }

    async getTypeOfUserProperties() {
        const usersResponse = await this.getUsers();
        const users = await usersResponse?.json();
        return users.map((user: any) => [
            typeof user.id,
            typeof user.name,
            typeof user.email,
            typeof user.gender,
            typeof user.status
        ]);
    }


    /**
     * @description replaces each email with .co.il extension
    */
    async replaceEmailExtensionForUsers() {
        let users = await this.getUsers()
        let usersObject = await users?.json()
        let response: APIResponse | undefined
        try {
            for (let user of usersObject) {
                let email = user.email
                let emailExtension = await this.extractEmailExtension(email)
                if (emailExtension && emailExtension !== 'co.il') {
                    let newEmail = await email.replace(emailExtension, 'co.il');
                    let newEmailProperty = { email: newEmail }
                    response = await this.patch(`${this.usersEndpoint}/${user.id}`, { requestData: newEmailProperty, isAuthorizationRequired: true })
                }
            }
            return response
        } catch (error) {
            throw new Error(`the user emails could be undefined ${error}`)
        }
    }

    async getCurrentUserEmailExtension() {
        let extensions: string[] = []
        let users = await this.getUsers()
        let usersJsonObject = await users?.json()
        let userEmails = usersJsonObject
        for (let user of userEmails) {
            let extension = await this.extractEmailExtension(user.email)
            extensions.push(extension!)
        }
        return extensions
    }
}