const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");

const { expect } = chai;
chai.use(chaiHttp);

describe("POST /api/validate-schedule", () => {
  it("returns ok for conflict-free schedule", async () => {
    const res = await chai
      .request(app)
      .post("/api/validate-schedule")
      .send({
        items: [
          {
            id: "a",
            code: "C1",
            credits: 3,
            day: 0,
            startTime: "09:00",
            endTime: "10:00",
          },
          {
            id: "b",
            code: "C2",
            credits: 4,
            day: 0,
            startTime: "10:00",
            endTime: "11:00",
          },
        ],
        creditCap: 18,
      });

    expect(res).to.have.status(200);
    expect(res.body.ok).to.equal(true);
  });

  it("flags overlap + duplicate", async () => {
    const res = await chai
      .request(app)
      .post("/api/validate-schedule")
      .send({
        items: [
          {
            id: "a",
            code: "C1",
            credits: 3,
            day: 0,
            startTime: "09:00",
            endTime: "10:00",
          },
          {
            id: "b",
            code: "C1",
            credits: 3,
            day: 0,
            startTime: "09:30",
            endTime: "10:30",
          },
        ],
      });

    expect(res).to.have.status(200);
    expect(res.body.ok).to.equal(false);
    expect(res.body.warnings.join(" ")).to.match(/overlap|duplicate/i);
  });
});
