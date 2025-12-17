# ProfPick

[![Continuous Integration](https://github.com/agile-students-fall2025/4-final-random_truthteller/actions/workflows/ci.yml/badge.svg)](https://github.com/agile-students-fall2025/4-final-random_truthteller/actions/workflows/ci.yml)
[![Continuous Deployment](https://github.com/agile-students-fall2025/4-final-random_truthteller/actions/workflows/cd.yml/badge.svg)](https://github.com/agile-students-fall2025/4-final-random_truthteller/actions/workflows/cd.yml)

**Live Demo:** http://157.245.219.54:3000/

Smarter course planning with in‑context professor ratings

## Extra Credit Features

We have completed the following extra credit requirements for deployment:

- **Docker Containerization:** The application is fully containerized using Docker.
- **Continuous Integration (CI):** A GitHub Actions workflow runs build and test cycles on every push.
- **Continuous Deployment (CD):** An automated workflow deploys updates to our Digital Ocean Droplet whenever changes are pushed to the master branch.

## Team Members

- [Haider Asif](https://github.com/rediah321)
- [Ethan Zheng](https://github.com/ethanzzheng)
- [Evan Zuo](https://github.com/EvanZuo1108)
- [Ogechi Okafor](https://github.com/ookafor410)
- [Xiaomin Liu](https://github.com/xl4624)

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
> After setting up your MongoDB connection, you can either:
> 
> - Seed the database with sample course data:
>   ```bash
>   cd back-end
>   node scripts/seedCourses.js
>   ```
> 
> - Scrape real NYU course data from the course catalog:
>   ```bash
>   cd back-end
>   node scripts/scrapeNYUCourses.js [--clear] [--limit N]
>   ```
>   
>   The scraper supports optional flags:
>   - `--clear`: Clear existing courses before scraping
>   - `--limit=N`: Limit the number of courses to scrape (e.g., `--limit=10`)
>   
>   Example:
>   ```bash
>   node scripts/scrapeNYUCourses.js --clear --limit=50
>   ```
