import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server.js";

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

  describe("GET /api/reviews", () => {
    it("should return all course reviews", (done) => {
      chai
        .request(app)
        .get("/api/reviews/course")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array").that.is.not.empty;
          expect(res.body[0]).to.include.keys(
            "id",
            "rating",
            "reviewText",
            "date",
          );
          done();
        });
    });

    it("should return filtered course reviews by name", (done) => {
      chai
        .request(app)
        .get("/api/reviews/course/CS%20101%20-%20Intro%20to%20CS")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array").that.is.not.empty;
          res.body.forEach((review) => {
            expect(review.course).to.equal("CS 101 - Intro to CS");
          });
          done();
        });
    });

    it("should return all professor reviews", (done) => {
      chai
        .request(app)
        .get("/api/reviews/professor")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array").that.is.not.empty;
          expect(res.body[0]).to.include.keys(
            "id",
            "rating",
            "reviewText",
            "date",
          );
          done();
        });
    });

    it("should return filtered professor reviews by name", (done) => {
      chai
        .request(app)
        .get("/api/reviews/professor/Dr.%20Ada%20Lovelace")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array").that.is.not.empty;
          res.body.forEach((review) => {
            expect(review.professor).to.equal("Dr. Ada Lovelace");
          });
          done();
        });
    });
  });
});
