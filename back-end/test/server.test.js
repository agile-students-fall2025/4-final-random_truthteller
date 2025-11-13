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

  describe("GET /api/courses/:id", () => {
    it("should return course details when course exists", (done) => {
      chai
        .request(app)
        .get("/api/courses/1")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.include({
            id: 1,
            code: "CS 101",
            title: "Intro to Computer Science",
          });
          expect(res.body).to.have.property("sections").that.is.an("array");
          done();
        });
    });

    it("should return 404 when course does not exist", (done) => {
      chai
        .request(app)
        .get("/api/courses/999")
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("error", "Course not found");
          done();
        });
    });
  });
});
