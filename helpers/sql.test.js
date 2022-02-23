"use strict";

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("Testing sqlForPartialUpdate", function(){

  const userData = {
    firstName: "mister",
    lastName: "dawg"
  }
  const userJStoSQL = {
    firstName: "first_name",
    lastName: "last_name"
  }

  const companyData = {
    name: "Dawg Inc",
    description: "Movers and shakers of dogdom"
  }

  const emptyData = {};

  test("test company data", function(){
    const results = sqlForPartialUpdate(companyData, {});

    expect(results).toEqual(
      {
        setCols: "\"name\"=$1, \"description\"=$2",
        values: [ "Dawg Inc", "Movers and shakers of dogdom"]
      }
    );
  });

  test("test user data", function(){
    const results = sqlForPartialUpdate(userData, userJStoSQL);

    expect(results).toEqual(
      {
        setCols: "\"first_name\"=$1, \"last_name\"=$2",
        values: [ "mister", "dawg"]
      }
    );
  });

  test("tests empty obj arg for dataToUpdate", function(){
    expect(() => sqlForPartialUpdate(emptyData, userJStoSQL))
    .toThrow("No data");

    //need to wrap in fn--
    //otherwise error won't be caught, assertion will fail

  });





});