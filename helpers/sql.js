const { BadRequestError } = require("../expressError");

/** takes in object of {data, data ...}
 * and object of {dataJSNAME : dataSQLname ...}
 *
 * data needs to represent cols in db (IE user cols, company cols)
 * column key names are transformed into valid sql col names IE:
 * firstName col becomes first_name col.
 * the value of the column is then set to a SQL variable like ${integer}
 *
 * function returns object like:
 * {setCols: columns, values: values}
 * !!!!IMPORTANT, FUNCTION DOES NOT VALIDATE DATA or JSTOSQL, PLEASE ADHERE TO
 * docstring requirements!!!!
 */

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
