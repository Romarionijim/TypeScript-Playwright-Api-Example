import { fa, faker } from "@faker-js/faker";

export default class MockDataGenerator {

    public static getDogNameBreed(): string {
        return faker.animal.dog()
    }

    public static getCatNameBreed(): string {
        return faker.animal.cat()
    }

    public static getRandomLongNumber(): number {
        return faker.number.int({ min: 1000, max: 5000 })
    }

    public static getRandomName(): string {
        return faker.internet.domainName()
    }

    public static getRandomMaleFirstName(): string {
        return faker.person.firstName('male')
    }

    public static getRandomFemaleFirstName(): string {
        return faker.person.firstName('female')
    }

    public static getRandomEmail(): string {
        return faker.internet.email()
    }

    public static getRandomNumber(): number {
        return faker.number.int({ min: 1000, max: 10000 })
    }
}