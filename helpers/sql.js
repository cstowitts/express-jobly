const { BadRequestError } = require("../expressError");

/** takes in object of data to update {data, data ...}
 * and object of {dataJSNAME : dataSQLname ...}
 *
 * data needs to represent cols in db (IE user cols, company cols)
 * column key names => valid sql col names IE:
 * firstName => first_name
 * the value of the column is then set to a SQL variable like ${integer}
 *
 * function returns object:
 * {setCols: columns, values: values}
 *
 * function only validates that the dataToUpdate obj is NOT empty
 */

//TODO: grab test and put into docstring to illustrate what this fn does

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
