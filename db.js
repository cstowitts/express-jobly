"use strict";

/** Database setup for jobly. */

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

const db = new Client({
  connectionString: getDatabaseUri(),
});

db.connect();

//getNumericType();


/**this is for testing what PG returns when querying a NUMERIC sql type */
async function getNumericType(){
  const results = await db.query(
    `SELECT * FROM jobs`
  );

  console.log("results: ", results.rows[0]);
  console.log("equity type: ", typeof(results.rows[0].equity));
}

module.exports = db;
