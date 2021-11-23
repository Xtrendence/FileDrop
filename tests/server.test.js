const supertest = require("supertest");
const app = require("../app");

test("Should return 200", async () => {
	let response = await supertest(app).get("/");
	expect(response.statusCode).toEqual(200);
});