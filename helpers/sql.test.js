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

  /** Expect output to be:
   * {
   *  setCols: "name, description",
   *  values: [ "Dawg Inc", "Moves and shakers of dogdom"]
   * }
   */
  const companyData = {
    name: "Dawg Inc",
    description: "Moves and shakers of dogdom"
  }

  test("test company data", function(){
    const results = sqlForPartialUpdate(companyData, {});

    expect(results).toEqual(
      {
        setCols: "\"name\"=$1, \"description\"=$2",
        values: [ "Dawg Inc", "Moves and shakers of dogdom"]
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
});