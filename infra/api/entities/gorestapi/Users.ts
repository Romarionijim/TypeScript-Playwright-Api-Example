import { APIResponse } from "@playwright/test";
import { ApiClient, PaginationType, RequestMethod } from "../../apiClient/ApiClient";
import Randomizer from "../../helpers/faker/Randomizer";
import { ApplicationUrl } from "../../helpers/urls/ApplicationUrl";
import { ApiEndpoints } from "../../endpoints/ApiEndpoints";

export class Users extends ApiClient {
    private usersEnpoint = `${ApplicationUrl.GO_REST_API}/${ApiEndpoints.USERS_ENDPOINT}`

    public async getUsers() {
        let response = await this.get(this.usersEnpoint)
        return response;
    }

    public async getGender(gender: string) {
        let response = await this.get(this.usersEnpoint)
        let responseObject = await response?.json()
        let genderFilter = responseObject.filter((el: any) => el.gender === gender).length
        return genderFilter
    }

    /**
     * @description make both genders even for the first default 10 records without pagination
     * @returns 
     */
    public async makeBothGendersEven() {
        let response: APIResponse | undefined
        let maleUsers = await this.getGender('male');
        let femaleUsers = await this.getGender('female');
        try {
            let differrence = Math.abs(maleUsers - femaleUsers)
            if (maleUsers === femaleUsers) {
                return;
            } else if (maleUsers > femaleUsers) {
                for (let i = 0; i < differrence; i++) {
                    let femaleData = {
                        id: Randomizer.getRandomNumber(),
                        name: Randomizer.getRandomFemaleFirstName(),
                        email: Randomizer.getRandomEmail(),
                        gender: 'female',
                        status: 'active',
                    }
                    response = await this.post(this.usersEnpoint, { requestData: femaleData, authoriaztionRequired: true })
                }
            } else {
                for (let i = 0; i < differrence; i++) {
                    let maleData = {
                        id: Randomizer.getRandomNumber(),
                        name: Randomizer.getRandomMaleFirstName(),
                        email: Randomizer.getRandomEmail(),
                        gender: 'male',
                        status: 'active',
                    }
                    response = await this.post(this.usersEnpoint, { requestData: maleData, authoriaztionRequired: true })
                }
            }
            return response;
        } catch (error) {
            throw new Error(`an error occured in makeBothGendersEven function: ${error}`)
        }
    }

    private async getUserStatus(status: string) {
        let users = await this.get(this.usersEnpoint)
        let usersJsonObject = await users?.json()
        let inactiveUsesrs = usersJsonObject.filter((user: { status: string; }) => user.status === status)
        return inactiveUsesrs
    }

    public async getInActiveUsers() {
        let res = await this.getUserStatus('inactive')
        return res
    }

    public async deleteInactiveUsers() {
        let response: APIResponse | undefined
        let inActiveUsers = await this.getInActiveUsers()
        for (let user of inActiveUsers) {
            response = await this.delete(`${this.usersEnpoint}/${user.id}`, { authoriaztionRequired: true })
        }
        return response;
    }

    /**
     * @description get all of the users using page pagination
     * @returns 
     */
    public async getAllUsers(page: number) {
        let response = await this.paginateRequest(RequestMethod.GET, this.usersEnpoint, PaginationType.PAGE_PAGINATION, { paginateRequest: true, pagePagination: true, pageNumber: page })
        return response;
    }

    public async getTypeOfUserProperies() {
        let users = await this.getUsers();
        let userObject = await users?.json()
        let types: any = [];
        for (let user of userObject) {
            types.push([typeof user.id, typeof user.name, typeof user.email, typeof user.gender, typeof user.status]);
        }
        return types;
    }

    private async extractEmailExtension(email: string) {
        let domain = email.split('@').pop()
        let extension = domain?.split('.').pop()
        return extension
    }

    /**
     * @description replaces each email with .co.il extension
     */
    public async replaceEmailExtensionForUsers() {
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
                    response = await this.patch(`${this.usersEnpoint}/${user.id}`, { requestData: newEmailProperty, authoriaztionRequired: true })
                }
            }
            return response
        } catch (error) {
            throw new Error(`the user emails could be undefined ${error}`)
        }
    }

    public async getCurrentUserEmailExtension() {
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