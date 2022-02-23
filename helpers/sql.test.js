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

  const undefinedData = {
    testData: undefined
  }

  const badJStoSQL = {
    firstName: "iceCream",
    lastName: "lastName"
  }

  test("test company data, with no JS=>SQL", function(){
    const results = sqlForPartialUpdate(companyData, {});

    expect(results).toEqual(
      {
        setCols: "\"name\"=$1, \"description\"=$2",
        values: [ "Dawg Inc", "Movers and shakers of dogdom"]
      }
    );
  });

  test("test user data, with JS=>SQL", function(){
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
    .toThrow("No data")

    //need to wrap in fn--
    //otherwise error won't be caught, assertion will fail
    //could also have had a try/catch block (matches other test files)
      //fail() in the try block to make sure the fn fails
        //if err isn't thrown (would be bug in code),
        //fail() runs only then
    //inside catch: expect type of error was badReqErr

  });

  test("test undefined data", function(){
    const results = sqlForPartialUpdate(undefinedData, {});

    expect(results).toEqual(
      {
        setCols: "\"testData\"=$1",
        values: [ undefined ]
      }
    );
  });

  test("test badJStoSQL on data", function(){
    const results = sqlForPartialUpdate(userData, badJStoSQL);

    expect(results).toEqual(
      {
        setCols: "\"iceCream\"=$1, \"lastName\"=$2",
        values: [ "mister", "dawg"]
      }
    );
  });




});