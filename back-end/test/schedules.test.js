import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server.js";

const { expect } = chai;
chai.use(chaiHttp);

const createSchedule = async (name = "Temporary Schedule") => {
  const response = await chai
    .request(app)
    .post("/api/schedules")
    .send({ name });
  expect(response).to.have.status(201);
  return response.body;
};

describe("Schedule routes", () => {
  describe("GET /api/schedules", () => {
    it("should return all schedules", (done) => {
      chai
        .request(app)
        .get("/api/schedules")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          expect(res.body.length).to.be.at.least(1); // At least the default 1
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
    it("should return an array of events for a schedule (possibly empty)", (done) => {
      chai
        .request(app)
        .get("/api/schedules/s1/events")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          // s1 starts empty by default
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

  describe("POST /api/schedules/:id/events", () => {
    it("should add events to a schedule", async () => {
      const schedule = await createSchedule("Events Test Schedule");
      const payload = {
        events: [
          {
            courseName: "Test Course",
            day: 0,
            startTime: "09:00",
            endTime: "10:00",
            professor: "Test Professor",
            room: "Room 101",
          },
        ],
      };

      const createRes = await chai
        .request(app)
        .post(`/api/schedules/${schedule.id}/events`)
        .send(payload);

      expect(createRes).to.have.status(201);
      expect(createRes.body).to.be.an("array").with.length(1);
      expect(createRes.body[0]).to.include({
        courseName: "Test Course",
        day: 0,
        startTime: "09:00",
        endTime: "10:00",
      });

      const eventsRes = await chai
        .request(app)
        .get(`/api/schedules/${schedule.id}/events`);

      expect(eventsRes).to.have.status(200);
      expect(eventsRes.body).to.be.an("array").with.length(1);

      const scheduleRes = await chai
        .request(app)
        .get(`/api/schedules/${schedule.id}`);

      expect(scheduleRes).to.have.status(200);
      expect(scheduleRes.body).to.have.property("classes", 1);
    });

    it("should return 400 when events payload is not an array", async () => {
      const schedule = await createSchedule("Events Payload Error Schedule");
      const response = await chai
        .request(app)
        .post(`/api/schedules/${schedule.id}/events`)
        .send({});

      expect(response).to.have.status(400);
      expect(response.body).to.have.property(
        "error",
        "Events must be an array",
      );
    });
  });

  describe("DELETE /api/schedules/:id/events/:eventId", () => {
    it("should delete an existing event", async () => {
      const schedule = await createSchedule("Delete Event Schedule");
      const createRes = await chai
        .request(app)
        .post(`/api/schedules/${schedule.id}/events`)
        .send({
          events: [
            {
              courseName: "Removable Course",
              day: 1,
              startTime: "11:00",
              endTime: "12:00",
            },
          ],
        });

      const eventId = createRes.body[0].id;

      const deleteRes = await chai
        .request(app)
        .delete(`/api/schedules/${schedule.id}/events/${eventId}`);

      expect(deleteRes).to.have.status(204);

      const eventsRes = await chai
        .request(app)
        .get(`/api/schedules/${schedule.id}/events`);

      expect(eventsRes).to.have.status(200);
      expect(eventsRes.body).to.be.an("array").with.length(0);

      const scheduleRes = await chai
        .request(app)
        .get(`/api/schedules/${schedule.id}`);

      expect(scheduleRes).to.have.status(200);
      expect(scheduleRes.body).to.have.property("classes", 0);
    });

    it("should return 404 when event is not found", async () => {
      const schedule = await createSchedule("Missing Event Schedule");
      const response = await chai
        .request(app)
        .delete(`/api/schedules/${schedule.id}/events/non-existent-event`);

      expect(response).to.have.status(404);
      expect(response.body).to.have.property("error", "Event not found");
    });
  });

  describe("/api/schedules/current", () => {
    it("should default to the first available schedule", async () => {
      const schedulesRes = await chai.request(app).get("/api/schedules");
      expect(schedulesRes).to.have.status(200);
      const firstScheduleId = schedulesRes.body[0].id;

      const currentRes = await chai.request(app).get("/api/schedules/current");
      expect(currentRes).to.have.status(200);
      expect(currentRes.body).to.deep.equal({ scheduleId: firstScheduleId });
    });

    it("should update the current schedule when provided", async () => {
      const schedule = await createSchedule("Current Schedule Choice");

      const updateRes = await chai
        .request(app)
        .put("/api/schedules/current")
        .send({ scheduleId: schedule.id });

      expect(updateRes).to.have.status(200);
      expect(updateRes.body).to.deep.equal({ scheduleId: schedule.id });

      const currentRes = await chai.request(app).get("/api/schedules/current");
      expect(currentRes).to.have.status(200);
      expect(currentRes.body).to.deep.equal({ scheduleId: schedule.id });
    });

    it("should return 404 when setting an unknown schedule", async () => {
      const response = await chai
        .request(app)
        .put("/api/schedules/current")
        .send({ scheduleId: "missing-schedule" });

      expect(response).to.have.status(404);
      expect(response.body).to.have.property("error", "Schedule not found");
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

  describe("GET /api/schedules/:id/export", () => {
    it("should export a schedule with events as .ics file", async () => {
      const schedule = await createSchedule("Export Test Schedule");
      const payload = {
        events: [
          {
            courseName: "Intro to Testing",
            day: 0,
            startTime: "09:00",
            endTime: "10:00",
            professor: "Prof Test",
            room: "Room 100",
          },
          {
            courseName: "Advanced Testing",
            day: 2,
            startTime: "11:00",
            endTime: "12:30",
            professor: "Prof Test",
            room: "Room 200",
          },
        ],
      };

      const createRes = await chai
        .request(app)
        .post(`/api/schedules/${schedule.id}/events`)
        .send(payload);

      expect(createRes).to.have.status(201);

      const res = await chai.request(app).get(`/api/schedules/${schedule.id}/export`);

      expect(res).to.have.status(200);
      expect(res).to.have.header(
        "content-type",
        "text/calendar; charset=utf-8",
      );
      expect(res).to.have.header("content-disposition");
      expect(res.headers["content-disposition"]).to.include("attachment");
      expect(res.headers["content-disposition"]).to.match(
        /filename="[^"]*\.ics"/,
      );
      expect(res.text).to.be.a("string");
      expect(res.text).to.include("BEGIN:VCALENDAR");
      expect(res.text).to.include("END:VCALENDAR");
      expect(res.text).to.include("BEGIN:VEVENT");
      expect(res.text).to.include("END:VEVENT");
    });

    it("should include correct event details in .ics file", async () => {
      const schedule = await createSchedule("Export Details Schedule");
      const payload = {
        events: [
          {
            courseName: "Intro to Computer Science",
            day: 0,
            startTime: "09:00",
            endTime: "10:30",
            professor: "Prof 1",
            room: "Room 204",
          },
          {
            courseName: "Intro to Data Structures",
            day: 2,
            startTime: "10:00",
            endTime: "11:30",
            professor: "Prof 2",
            room: "Hall A",
          },
        ],
      };

      const createRes = await chai
        .request(app)
        .post(`/api/schedules/${schedule.id}/events`)
        .send(payload);

      expect(createRes).to.have.status(201);

      const res = await chai.request(app).get(`/api/schedules/${schedule.id}/export`);
      expect(res).to.have.status(200);
      const icsContent = res.text;

      // Check for course names
      expect(icsContent).to.include("Intro to Computer Science");
      expect(icsContent).to.include("Intro to Data Structures");

      // Check for recurrence rule (weekly)
      expect(icsContent).to.include("RRULE:FREQ=WEEKLY");
      expect(icsContent).to.include("BYDAY=MO");
      expect(icsContent).to.include("BYDAY=WE");

      // Check for location/room
      expect(icsContent).to.include("Room 204");
      expect(icsContent).to.include("Hall A");

      // Check for professor in description
      expect(icsContent).to.include("Prof 1");
      expect(icsContent).to.include("Prof 2");
    });

    it("should include correct start and end times in .ics file", async () => {
      const schedule = await createSchedule("Export Times Schedule");
      const payload = {
        events: [
          {
            courseName: "Timing Course 1",
            day: 0,
            startTime: "09:00",
            endTime: "10:00",
          },
          {
            courseName: "Timing Course 2",
            day: 2,
            startTime: "11:00",
            endTime: "12:30",
          },
        ],
      };

      const createRes = await chai
        .request(app)
        .post(`/api/schedules/${schedule.id}/events`)
        .send(payload);

      expect(createRes).to.have.status(201);

      const res = await chai.request(app).get(`/api/schedules/${schedule.id}/export`);
      expect(res).to.have.status(200);
      const icsContent = res.text;

      // Check for DTSTART and DTEND (times should be in format YYYYMMDDTHHMMSS)
      // The exact times will vary based on when the test runs, but we can check the format
      expect(icsContent).to.match(/DTSTART:\d{8}T\d{6}/);
      expect(icsContent).to.match(/DTEND:\d{8}T\d{6}/);

      // Check that DTSTART and DTEND appear multiple times (one per event)
      const dtstartMatches = icsContent.match(/DTSTART:\d{8}T\d{6}/g);
      const dtendMatches = icsContent.match(/DTEND:\d{8}T\d{6}/g);
      expect(dtstartMatches).to.be.an("array");
      expect(dtendMatches).to.be.an("array");
      expect(dtstartMatches.length).to.be.at.least(2);
      expect(dtendMatches.length).to.be.at.least(2);

      // Verify that each DTSTART has a corresponding DTEND
      expect(dtstartMatches.length).to.equal(dtendMatches.length);
    });

    it("should return 404 when exporting non-existent schedule", (done) => {
      chai
        .request(app)
        .get("/api/schedules/non-existent-id/export")
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("error", "Schedule not found");
          done();
        });
    });

    it("should return 400 when schedule has no events", async () => {
      const emptySchedule = await createSchedule("Empty Export Schedule");

      const res = await chai
        .request(app)
        .get(`/api/schedules/${emptySchedule.id}/export`);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "error",
        "Schedule has no events to export",
      );
    });

    it("should have proper filename format in Content-Disposition header", async () => {
      const schedule = await createSchedule("Schedule 1");
      const payload = {
        events: [
          {
            courseName: "Some Course",
            day: 0,
            startTime: "09:00",
            endTime: "10:00",
          },
        ],
      };

      const createRes = await chai
        .request(app)
        .post(`/api/schedules/${schedule.id}/events`)
        .send(payload);

      expect(createRes).to.have.status(201);

      const res = await chai.request(app).get(`/api/schedules/${schedule.id}/export`);

      expect(res).to.have.status(200);
      expect(res.headers["content-disposition"]).to.be.a("string");
      expect(res.headers["content-disposition"]).to.include("filename=");
      expect(res.headers["content-disposition"]).to.include(".ics");
      expect(res.headers["content-disposition"]).to.match(
        /filename="[^"]*\.ics"/,
      );
    });
  });
});
