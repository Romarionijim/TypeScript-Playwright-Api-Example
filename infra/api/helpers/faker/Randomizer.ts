import { fa, faker } from "@faker-js/faker";

export default class Randomizer {

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
}