# TypeScript-Playwright-Api-Example
* This is an API automation infra mini project that covers 3 different entities/recources with different URLs and endpoints
In this project I'm using TypeScript with Playwright API request object for api automation development and testing => https://playwright.dev/docs/api-testing
* to navigate this infra - it goes as the following structure
* for the infra => infra folder => api => apiRequests - this contains the base api requests that has reusable functions that handle rest api CRUD operations including pagination
* entities => represents the infra and functions for the specific entities that are testes.
* test => tests folder - contains basic tests for those entities and endpoints
keep in mind that the gorestapi endpoint is not flexible and has a lot of bugs on their end.