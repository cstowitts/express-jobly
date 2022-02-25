"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies */

class Jobs {
    /** Create a job (from data), update db, return new job data
     *
     * data should be { title, salary, equity, company_handle }
     *
     * Returns { title, salary, equity, company_handle }
     *
     * Throws BadRequestError if company already in database.
     * */

    static async create({ title, salary, equity, company_handle }) {
        const duplicateCheck = await db.query(
            `SELECT title
                FROM jobs
                WHERE title = $1`,
            [handle]);

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate job: ${title}`);
        }

        const result = await db.query(
            `INSERT INTO jobs(
                title,
                salary,
                equity,
                company_handle)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                title,
                salary,
                equity,
                company_handle AS "companyHandle",
            )`,
            [
                title,
                salary,
                equity,
                companyHandle
            ],
        );

        const job = result.rows[0];

        return job;
    }

    /** Finds all jobs
     *
     * Returns [{ title, salary, equity, companyHandle }, ...]
     * */

    static async findAll() {
        const jobRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle",
            FROM jobs
            ORDER BY title, companyHandle`);

        return jobRes.rows;
    }

    /** Find all jobs matching filter(s) like:
    *
    * title: string
    * minSalary: int (>= 0, returns inclusive )
    * hasEquity: int (<= 1.0, returns inclusive )
    *
    * Accepts an object of filter parameters:
    * {name, minSalary, hasEquity}
    *
    * if hasEquity: false, or not included in filtering,
    * lists all jobs regardless of equity
    *
    * Returns an array of job POJOs:
    * [{ title, salary, equity, company_handle }, ...]
    *
    * This function is always given sanitized input FROM the route
    * does not validate anything
    */

    static async filter({ title, minSalary, hasEquity }) {

        //creates SQL query string based on args, won't scale with additional filters
        //could also be put into a helper fn and called here!
        let filters = [];
        let vals = [];

        //don't rely on accidental truthiness, we mean if it's NOT undefined
        if (title !== undefined) {
            vals.push(`%${title}%`);
            filters.push(`"name" ILIKE $${vals.length}`);
        }

        if (minSalary !== undefined) {
            vals.push(`${minSalary}`);
            filters.push(`"salary" >= $${vals.length}`);
        }
        if (hasEquity === true) {
            vals.push(`${hasEquity}`);
            filters.push(`"equity" > 0`);
        }

        const filterStr = filters.join(" AND ");

        /** Potential refactor??******
        //const filters = Object.keys(filterData);
         *
        const filterStr = filters.map((colName, idx) =>
          `"${colName} = $${idx + 1}`
          //CASE NAME:
          //"nameLike" ILIKE '%$1%'
          //CASE MIN:
          //"num_employees" >= $2
          //CASE MAX:
          //"num_employees" <= $3
        );
        */

        const queryString = `SELECT title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
                  FROM jobs
                  WHERE ${filterStr}
                  ORDER BY name`;

        const companiesRes = await db.query(queryString, vals);
        return companiesRes.rows;

        //could have split the fn into a helper that constructs the WHERE clause
        //and a method (.filter) that uses the helper
        //would have been easier to test
        //test the lower fn, then other tests to test the higher fn
    }

    /** Given a job title, return data about company.
     *
     * Returns { title, salary, equity, companyHandle]
     *
     * Throws NotFoundError if not found.
     **/

    static async get(id) {
        const jobRes = await db.query(
            `SELECT title,
            salary,
            equity,
            company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`,
            [id]);

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job matching id of: ${id}`);

        return job;
    }

    /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING id, title, salary, equity, companyHandle`
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job matching id of: ${id}`);

        return job;
    }

    /** Delete given job from database; returns undefined
     * 
     * Throws NotFoundError if company not found
     * */

    static async remove(id) {
        const result = await db.query(
            `DELETE
                FROM jobs
                WHERE id = $1
                RETURNING title`, 
            [id]);
        const job = result.rows[0];

        if(!job) throw new NotFoundError(`No job matching id: ${id}`);
    }


}

module.exports = Job;