import { APIResponse } from "@playwright/test";
import { ApiClient } from "@api-client";
import MockDataGenerator, { ApplicationUrl, RequestMethod, PaginationType, payloads, IUser } from "@api-helpers";
import { ApiEndpoints } from "@api-endpoints";

export class Users extends ApiClient {
    private usersEndpoint = `${ApplicationUrl.GO_REST_API}/${ApiEndpoints.USERS_ENDPOINT}`

    async getUsers() {
        let response = await this.get(this.usersEndpoint)
        return response;
    }

    async getGenderCount(gender: string): Promise<number> {
        let response = await this.get(this.usersEndpoint)
        let responseObject = await response?.json()
        let genderFilter = responseObject.filter((user: IUser) => user.gender === gender)
        let genderCount = genderFilter.length
        return genderCount
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
        let res = await this.getUserStatus('inactive')
        return res
    }

    async deleteInactiveUsers() {
        let inActiveUsers = await this.getInactiveUsers()
        let response: APIResponse[] = await Promise.all(
            inActiveUsers.map((user: IUser) =>
                this.delete(`${this.usersEndpoint}/${user.id}`, { isAuthorizationRequired: true })
            )
        );
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
        return users.map((user: IUser) => [
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
    async replaceEmailExtensionForUsers(): Promise<APIResponse[]> {
        let users = await this.getUsers()
        let usersObject = await users?.json()
        try {
            let response: APIResponse[] = await Promise.all(usersObject.map(async (user: IUser) => {
                let email = user.email;
                if (email) {
                    let extension = await this.extractEmailExtension(email);
                    if (extension && extension !== 'co.il') {
                        const updatedEmail = email.replace(extension, 'co.il');
                        return this.patch(
                            `${this.usersEndpoint}/${user.id}`,
                            {
                                requestData: { email: updatedEmail },
                                isAuthorizationRequired: true
                            }
                        );
                    }
                }
            }));
            return response.filter((res: APIResponse) => res !== undefined);
        } catch (error) {
            throw new Error(`Error updating email extensions: ${error}`);
        }
    }
    async getCurrentUserEmailExtension() {
        let users = await this.getUsers()
        let usersJsonObject = await users?.json()
        let extentions = await Promise.all(usersJsonObject.map(async (user: IUser) => {
            return user.email ? await this.extractEmailExtension(user.email) : undefined
        }))
        return extentions;
    }

    private async extractEmailExtension(email: string) {
        let domain = email.split('@').pop()
        let extension = domain?.split('.').pop()
        return extension
    }

    private async getUserStatus(status: string) {
        let users = await this.get(this.usersEndpoint)
        let usersJsonObject = await users?.json()
        let inactiveUsers = usersJsonObject.filter((user: IUser) => user.status === status)
        return inactiveUsers
    }
}