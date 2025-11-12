const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");

const { expect } = chai;
chai.use(chaiHttp);

describe("POST /api/validate-schedule", () => {
  it("should return ok for conflict-free schedule", (done) => {
    chai
      .request(app)
      .post("/api/validate-schedule")
      .send({
        items: [
          {
            id: "a",
            code: "C1",
            credits: 4,
            day: 0,
            startTime: "09:00",
            endTime: "10:00",
          },
          {
            id: "b",
            code: "C2",
            credits: 4,
            day: 1,
            startTime: "10:00",
            endTime: "11:00",
          },
          {
            id: "c",
            code: "C3",
            credits: 4,
            day: 2,
            startTime: "11:00",
            endTime: "12:00",
          },
        ],
        creditCap: 18,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.ok).to.equal(true);
        expect(res.body.warnings).to.be.an("array");
        expect(res.body.warnings.length).to.equal(0);
        done();
      });
  });

  it("should flag overlap and duplicate", (done) => {
    chai
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
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.ok).to.equal(false);
        expect(res.body.warnings).to.be.an("array");
        expect(res.body.warnings.length).to.be.at.least(1);
        expect(res.body.warnings.join(" ")).to.match(/overlap|duplicate/i);
        done();
      });
  });
});
