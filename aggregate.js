const fs = require('fs');

const mapperPath = './continent.json';
const outputFile = './output/output.json';
// read file using async method and return a promise
const readFilePromise = function promiseFunction(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};
// write file using async method and return a promise
function writeFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (error) => {
      if (error === null) {
        resolve(data);
      } else {
        reject(error);
      }
    });
  });
}
// Aggregate Promise
const aggregate = filePath => new Promise((resolve, reject) => {
  Promise.all([readFilePromise(filePath), readFilePromise(mapperPath)]).then((values) => {
    const csvData = values[0];
    const mapperData = JSON.parse(values[1]);
    const Data = csvData.replace(/['"]+/g, '').split('\n');
    // console.log(Data);
    const header = Data.shift().split(',');
    // console.log(header);
    const countryIndex = header.indexOf('Country Name');
    const gdp2012Index = header.indexOf('GDP Billions (US Dollar) - 2012');
    const pop2012Index = header.indexOf('Population (Millions) - 2012');
    const continent = {};
    Data.forEach((row) => {
      const val = row.split(',');
      if (mapperData[val[countryIndex]] !== undefined) {
        const continentNm = mapperData[val[countryIndex]];
        if (continent[continentNm] === undefined) {
          continent[continentNm] = {};
          continent[continentNm].GDP_2012 = parseFloat(val[gdp2012Index]);
          continent[continentNm]
            .POPULATION_2012 = parseFloat(val[pop2012Index]);
        } else {
          continent[continentNm].GDP_2012 += parseFloat(val[gdp2012Index]);
          continent[continentNm]
            .POPULATION_2012 += parseFloat(val[pop2012Index]);
        }
      }
    });
    writeFile(outputFile, JSON.stringify(continent)).then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    });
  }).catch((error) => {
    reject(error);
  });
});
module.exports = aggregate;
