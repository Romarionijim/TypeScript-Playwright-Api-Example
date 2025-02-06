import MockDataGenerator from "@api-helpers";

export const payloads = {
  createdPet: {
    id: 3193,
    category: {
      id: MockDataGenerator.getRandomLongNumber(),
      name: MockDataGenerator.getRandomName()
    },
    name: 'Pikachu',
    photoUrls: ['https://ibb.co/wLWCrSX'],
    tags: [
      {
        id: MockDataGenerator.getRandomLongNumber(),
        name: MockDataGenerator.getRandomName(),
      }
    ],
    status: 'available'
  },

  updatePet: {
    id: 3193,
    category: {
      id: MockDataGenerator.getRandomLongNumber(),
      name: MockDataGenerator.getRandomName()
    },
    name: 'Pokey',
    photoUrls: ['https://ibb.co/0Z9v02Z'],
    tags: [
      {
        id: MockDataGenerator.getRandomLongNumber(),
        name: MockDataGenerator.getRandomName(),
      }
    ],
    status: 'available'
  },

  maleData: {
    id: MockDataGenerator.getRandomNumber(),
    name: MockDataGenerator.getRandomMaleFirstName(),
    email: MockDataGenerator.getRandomEmail(),
    gender: 'male',
    status: 'active',
  },

  femaleData: {
    id: MockDataGenerator.getRandomNumber(),
    name: MockDataGenerator.getRandomFemaleFirstName(),
    email: MockDataGenerator.getRandomEmail(),
    gender: 'female',
    status: 'active',
  }
}