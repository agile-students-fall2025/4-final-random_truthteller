import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server.js";

import User from "../models/User.js";
import Course from "../models/Course.js";
import Schedule from "../models/Schedule.js";

const { expect } = chai;
chai.use(chaiHttp);

describe("Schedule API Endpoints", () => {
  let testUser;
  let testCourse;
  let testSection;

  before(async () => {
    // Clean up any existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Schedule.deleteMany({});

    testUser = new User({
      email: "test@example.com",
      passwordHash: "password",
      accounts: [{ email: "test@example.com", name: "Test User" }],
    });
    await testUser.save();
    testUser.currentAccountId = testUser.accounts[0]._id;
    await testUser.save();

    testCourse = new Course({
      code: "CS-101",
      title: "Intro to Testing",
      credits: 3,
      department: "Computer Science",
      sections: [
        {
          number: "001",
          instructor: "Dr. Test",
          location: "Test Hall 101",
          events: [
            { day: 0, startTime: "10:00", endTime: "11:00" },
            { day: 2, startTime: "10:00", endTime: "11:00" },
          ],
        },
      ],
    });
    await testCourse.save();
    testSection = testCourse.sections[0];
  });

  after(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Schedule.deleteMany({});
  });

  afterEach(async () => {
    await Schedule.deleteMany({});
    testUser.currentSchedule = undefined;
    await testUser.save();
  });

  const createSchedule = async (name = "Test Schedule") => {
    const res = await chai
      .request(app)
      .post(`/api/schedules?userId=${testUser._id}`)
      .send({ name });
    expect(res).to.have.status(201);
    return res.body;
  };

  describe("GET /api/schedules", () => {
    it("should return an empty array if no schedules exist", async () => {
      const res = await chai
        .request(app)
        .get(`/api/schedules?userId=${testUser._id}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array").that.is.empty;
    });

    it("should return all schedules for the user", async () => {
      await createSchedule("Schedule A");
      await createSchedule("Schedule B");
      const res = await chai
        .request(app)
        .get(`/api/schedules?userId=${testUser._id}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array").with.lengthOf(2);
      expect(res.body[0]).to.have.property("name", "Schedule A");
      expect(res.body[1]).to.have.property("name", "Schedule B");
    });
  });

  describe("POST /api/schedules", () => {
    it("should create a new schedule", async () => {
      const name = "My New Schedule";
      const res = await chai
        .request(app)
        .post(`/api/schedules?userId=${testUser._id}`)
        .send({ name });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("name", name);
      expect(res.body).to.have.property("classes", 0);

      const scheduleInDb = await Schedule.findById(res.body.id);
      expect(scheduleInDb).to.not.be.null;
      expect(scheduleInDb.name).to.equal(name);
    });
  });

  describe("GET /api/schedules/:id/events", () => {
    it("should return populated events for a schedule", async () => {
      const schedule = await createSchedule("Populated Schedule");

      await chai
        .request(app)
        .post(`/api/schedules/${schedule.id}/events?userId=${testUser._id}`)
        .send({
          events: [
            {
              courseName: `${testCourse.code} - ${testCourse.title}`,
              professor: testSection.instructor,
              room: testSection.location,
              day: testSection.events[0].day,
              startTime: testSection.events[0].startTime,
              endTime: testSection.events[0].endTime,
            },
          ],
        });

      const res = await chai
        .request(app)
        .get(`/api/schedules/${schedule.id}/events?userId=${testUser._id}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array").with.lengthOf(2);
      const event = res.body[0];
      expect(event).to.have.property(
        "courseName",
        `${testCourse.code} - ${testCourse.title}`,
      );
      expect(event).to.have.property("professor", testSection.instructor);
      expect(event).to.have.property("room", testSection.location);
      expect(event).to.have.property("credits", testCourse.credits);
    });
  });

  describe("POST /api/schedules/:id/events", () => {
    it("should add a section to a schedule", async () => {
      const schedule = await createSchedule("Add Section Test");
      const payload = {
        events: [
          {
            courseName: `${testCourse.code} - ${testCourse.title}`,
            professor: testSection.instructor,
            room: testSection.location,
            day: testSection.events[0].day,
            startTime: testSection.events[0].startTime,
            endTime: testSection.events[0].endTime,
          },
        ],
      };

      const res = await chai
        .request(app)
        .post(`/api/schedules/${schedule.id}/events?userId=${testUser._id}`)
        .send(payload);

      expect(res).to.have.status(201);

      const updatedSchedule = await Schedule.findById(schedule.id);
      expect(updatedSchedule.sections).to.have.lengthOf(1);
      expect(updatedSchedule.sections[0].course.toString()).to.equal(
        testCourse._id.toString(),
      );
      expect(updatedSchedule.sections[0].section.toString()).to.equal(
        testSection._id.toString(),
      );
    });
  });

  describe("DELETE /api/schedules/:id/events/:eventId", () => {
    it("should delete a section from a schedule", async () => {
      const schedule = await Schedule.create({
        name: "Delete Section Test",
        user: testUser._id,
        sections: [{ course: testCourse._id, section: testSection._id }],
      });

      // The eventId format is: courseId-sectionId-day
      const eventId = `${testCourse._id}-${testSection._id}-0`;

      const res = await chai
        .request(app)
        .delete(
          `/api/schedules/${schedule._id}/events/${eventId}?userId=${testUser._id}`,
        );

      expect(res).to.have.status(204);

      const updatedSchedule = await Schedule.findById(schedule._id);
      expect(updatedSchedule.sections).to.be.an("array").that.is.empty;
    });
  });

  describe("GET /api/schedules/current", () => {
    it("should get the first schedule if none is set", async () => {
      const schedule1 = await createSchedule("First");
      await createSchedule("Second");

      const res = await chai
        .request(app)
        .get(`/api/schedules/current?userId=${testUser._id}`);
      expect(res).to.have.status(200);
      expect(res.body.scheduleId).to.equal(schedule1.id);
    });
  });

  describe("PUT /api/schedules/current", () => {
    it("should set the current schedule for the user", async () => {
      const schedule1 = await createSchedule("Schedule One");
      const schedule2 = await createSchedule("Schedule Two");

      const res = await chai
        .request(app)
        .put(`/api/schedules/current?userId=${testUser._id}`)
        .send({ scheduleId: schedule2.id });

      expect(res).to.have.status(200);
      expect(res.body.scheduleId).to.equal(schedule2.id);

      const user = await User.findById(testUser._id);
      expect(user.currentSchedule.toString()).to.equal(schedule2.id);
    });
  });
});
