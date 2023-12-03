import { APIResponse } from "@playwright/test";
import { ApiRequests, RequestMethods } from "../../apiRequests/ApiRequests";
import Randomizer from "../../helpers/faker/Randomizer";
import { ApplicationUrl } from "../../helpers/urls/ApplicationUrl";

export class Users extends ApiRequests {
    private usersEnpoint = `${ApplicationUrl.GO_REST_API}/users`

    public async getUsers() {
        let response = await this.get(this.usersEnpoint)
        return response;
    }

    private async getGender(gender: string) {
        let response = await this.get(this.usersEnpoint)
        let responseObject = await response?.json()
        let genderFilter = responseObject.filter((el: any) => el.gender === gender).length
        return genderFilter
    }

    public async getMaleUsers() {
        let res = await this.getGender('male')
        return res
    }

    public async getFemaleUsers() {
        let res = await this.getGender('female')
        return res
    }

    /**
     * @description make both genders even for the first default 10 records without pagination
     * @returns 
     */
    public async makeBothGendersEven() {
        let response: APIResponse | undefined
        let maleUsers = await this.getMaleUsers();
        let femaleUsers = await this.getFemaleUsers();
        try {
            let differrence = Math.abs(maleUsers - femaleUsers)
            if (maleUsers === femaleUsers) {
                return response;
            } else if (maleUsers > femaleUsers) {
                let femaleData = {
                    id: Randomizer.getRandomNumber(),
                    name: Randomizer.getRandomFemaleFirstName(),
                    email: Randomizer.getRandomEmail(),
                    gender: 'female',
                    status: 'active',
                }
                for (let i = 0; i < differrence; i++) {
                    response = await this.post(this.usersEnpoint, femaleData, { authoriaztionRequired: true })
                }
            } else {
                let maleData = {
                    id: Randomizer.getRandomNumber(),
                    name: Randomizer.getRandomMaleFirstName(),
                    email: Randomizer.getRandomEmail(),
                    gender: 'male',
                    status: 'active',
                }
                for (let i = 0; i < differrence; i++) {
                    response = await this.post(this.usersEnpoint, maleData, { authoriaztionRequired: true })
                }
            }

            return response;
        } catch (error) {
            throw new Error(`an error occured in makeBothGendersEven function: ${error}`)
        }
    }

    public async getInActiveUsers() {
        let queryParams = {
            status: 'inactive'
        }
        let response = await this.get(this.usersEnpoint, { queryParams })
        let inActiveUsersObject = await response?.json()
        return inActiveUsersObject;
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
        let response = await this.paginateRequest(RequestMethods.GET, this.usersEnpoint, { paginateRequest: true, pagePagination: true, pageNumber: page })
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
                let emailExtension = await this.extractEmailExtension(user.email)
                if (emailExtension && emailExtension !== 'co.il') {
                    let newEmail = emailExtension.replace(emailExtension, 'co.il')
                    let newEmailProperty = { email: newEmail }
                    response = await this.patch(`${this.usersEnpoint}/${user.id}`, newEmailProperty, { authoriaztionRequired: true })
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
        let userEmails = usersJsonObject.email
        for (let email of userEmails) {
            let extension = await this.extractEmailExtension(email)
            extensions.push(extension!)
        }
        return extensions
    }
}