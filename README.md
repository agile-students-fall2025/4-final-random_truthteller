# ProfPick

Smarter course planning with in‑context professor ratings

## Team Members

- [Haider Asif](https://github.com/rediah321)
- [Ethan Zheng](https://github.com/ethanzzheng)
- [Evan Zuo](https://github.com/EvanZuo1108)
- [Ogechi Okafor](https://github.com/ookafor410)

---

## What is it?

ProfPick helps students build better class schedules faster. It puts time blocks, sections, and instructor quality in one place so you are best prepared to make choices that can affect your entire semester.

## Why it matters

Course registration windows are hectic. Comparing section times while hunting for professor reviews is tedious and error‑prone. ProfPick reduces friction by surfacing the essentials next to the calendar where decisions happen.

## Who it’s for

NYU students who want to plan their upcoming semesters without the hassle of time conflicts.

## Run the front‑end

```bash
cd front-end
npm install
npm start
```

This launches the React app at `http://localhost:3000`.

> **Environment variables:**  
> Copy `front-end/.env.example` to `front-end/.env`, and enter your actual Mockaroo API key as `REACT_APP_MOCKAROO_API_KEY`.

## Run the back-end

```bash
cd back-end
npm install
npm start
```

This launches the Express.js server at `http://localhost:8000`.

> **Environment variables:**  
> Copy `back-end/.env.example` to `back-end/.env`, and enter your MongoDB Atlas connection string as `MONGODB_URI`.

> **Database setup:**  
> After setting up your MongoDB connection, seed the database with initial course data:
> ```bash
> cd back-end
> node scripts/seedCourses.js
> ```
