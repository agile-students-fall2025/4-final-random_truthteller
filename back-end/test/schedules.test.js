const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");

const { expect } = chai;
chai.use(chaiHttp);

describe("Schedule routes", () => {
  describe("GET /api/schedules", () => {
    it("should return all schedules", (done) => {
      chai
        .request(app)
        .get("/api/schedules")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          expect(res.body.length).to.be.at.least(3); // At least the default 3
          expect(res.body[0]).to.have.property("id");
          expect(res.body[0]).to.have.property("name");
          expect(res.body[0]).to.have.property("modified");
          expect(res.body[0]).to.have.property("classes");
          done();
        });
    });
  });

  describe("GET /api/schedules/:id", () => {
    it("should return a specific schedule by id", (done) => {
      chai
        .request(app)
        .get("/api/schedules/s1")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("id", "s1");
          expect(res.body).to.have.property("name");
          expect(res.body).to.have.property("modified");
          expect(res.body).to.have.property("classes");
          done();
        });
    });

    it("should return 404 when schedule not found", (done) => {
      chai
        .request(app)
        .get("/api/schedules/non-existent-id")
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("error", "Schedule not found");
          done();
        });
    });
  });

  describe("GET /api/schedules/:id/events", () => {
    it("should return events for a schedule", (done) => {
      chai
        .request(app)
        .get("/api/schedules/s1/events")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          expect(res.body.length).to.be.at.least(1);
          expect(res.body[0]).to.have.property("id");
          expect(res.body[0]).to.have.property("courseName");
          expect(res.body[0]).to.have.property("day");
          expect(res.body[0]).to.have.property("startTime");
          expect(res.body[0]).to.have.property("endTime");
          done();
        });
    });

    it("should return empty array for schedule with no events", (done) => {
      chai
        .request(app)
        .get("/api/schedules/s3/events")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          expect(res.body.length).to.equal(0);
          done();
        });
    });

    it("should return 404 when schedule not found", (done) => {
      chai
        .request(app)
        .get("/api/schedules/non-existent-id/events")
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("error", "Schedule not found");
          done();
        });
    });
  });

  describe("POST /api/schedules", () => {
    it("should create a new schedule with valid name", (done) => {
      chai
        .request(app)
        .post("/api/schedules")
        .send({ name: "Test Schedule" })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("id");
          expect(res.body).to.have.property("name", "Test Schedule");
          expect(res.body).to.have.property("modified");
          expect(res.body).to.have.property("classes", 0);
          done();
        });
    });

    it("should return 400 when name is missing", (done) => {
      chai
        .request(app)
        .post("/api/schedules")
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property(
            "error",
            "Schedule name is required",
          );
          done();
        });
    });

    it("should return 400 when name is empty string", (done) => {
      chai
        .request(app)
        .post("/api/schedules")
        .send({ name: "" })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property(
            "error",
            "Schedule name is required",
          );
          done();
        });
    });

    it("should return 400 when name is only whitespace", (done) => {
      chai
        .request(app)
        .post("/api/schedules")
        .send({ name: "   " })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property(
            "error",
            "Schedule name is required",
          );
          done();
        });
    });

    it("should trim whitespace from schedule name", (done) => {
      chai
        .request(app)
        .post("/api/schedules")
        .send({ name: "  Trimmed Schedule  " })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("name", "Trimmed Schedule");
          done();
        });
    });
  });

  describe("DELETE /api/schedules/:id", () => {
    it("should delete an existing schedule", (done) => {
      chai
        .request(app)
        .post("/api/schedules")
        .send({ name: "Schedule to Delete" })
        .end((err, createRes) => {
          expect(createRes).to.have.status(201);
          const scheduleId = createRes.body.id;

          chai
            .request(app)
            .delete(`/api/schedules/${scheduleId}`)
            .end((deleteErr, deleteRes) => {
              expect(deleteRes).to.have.status(204);
              done();
            });
        });
    });

    it("should return 404 when deleting non-existent schedule", (done) => {
      chai
        .request(app)
        .delete("/api/schedules/non-existent-id")
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("error", "Schedule not found");
          done();
        });
    });
  });
});
