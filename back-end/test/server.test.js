const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");

const { expect } = chai;
chai.use(chaiHttp);

describe("Server", () => {
  describe("GET /health", () => {
    it("should return server health status", (done) => {
      chai
        .request(app)
        .get("/health")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("status", "ok");
          expect(res.body).to.have.property("message", "Server is running");
          done();
        });
    });
  });
});
