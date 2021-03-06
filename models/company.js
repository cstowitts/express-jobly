"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
    return companiesRes.rows;
  }

  /** Find all companies matching filter(s) like:
   *
   * name: string, case-insensitive, matches any part of a string
   * minEmployees: int (>= 0, returns inclusive )
   * maxEmployees: int (>= minEmployees, returns inclusive )
   *
   * Accepts an object of filter parameters:
   * {name, minEmployees, maxEmployees}
   * if minEmployees > maxEmployees,
   * throws 400 error with appropriate message
   * ("maxEmployees must be greater than minEmployees");
   *
   * Returns an array of company POJOs:
   * [{ handle, name, description, numEmployees, logoUrl }, ...]
   *
   * This function is always given sanitized input FROM the route
   * only validates that minEmp < maxEmp, will throw BadRequestError
   */
 
  static async filter({ nameLike, minEmployees, maxEmployees }) {
    if (minEmployees > maxEmployees) {
      throw new BadRequestError(
        "maxEmployees must be greater than minEmployees"
      );
    };

    //creates SQL query string based on args, won't scale with additional filters
    //could also be put into a helper fn and called here!
    let filters = [];
    let vals = [];
    if (nameLike) {
      vals.push(`%${nameLike}%`);
      filters.push(`"name" ILIKE $${vals.length}`);
    }
    //don't rely on accidental truthiness, we mean if it's NOT undefined 
    //minEmp/maxEmp can be 0, valid input
    if (minEmployees !== undefined) {
      vals.push(`${minEmployees}`);
      filters.push(`"num_employees" >= $${vals.length}`);
    }
    if (maxEmployees !== undefined) {
      vals.push(`${maxEmployees}`);
      filters.push(`"num_employees" <= $${vals.length}`);
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

    const queryString = `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
                  FROM companies
                  WHERE ${filterStr}
                  ORDER BY name`;

    const companiesRes = await db.query(queryString, vals);
    return companiesRes.rows;

    //could have split the fn into a helper that constructs the WHERE clause
    //and a method (.filter) that uses the helper
    //would have been easier to test
    //test the lower fn, then other tests to test the higher fn
  }



  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
