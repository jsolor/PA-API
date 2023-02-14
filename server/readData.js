const fs = require('fs');
const csv = require('csv-parser');

const NUMBER_OF_QUESTIONS = 3518863;
const QUESTIONS_PATH = './testData/questions.csv';
const NUMBER_OF_PRODUCT = 1000011;
const PRODUCT_PATH = './testData/product.csv';

function readAndPrintCsv(path) {
  const results = [];

  const LENGTH = 6;

  fs.createReadStream(path)
    .pipe(csv())
    .on('data', (data) => {
      // validate number of keys
      if (Object.keys(data).length !== LENGTH) {
        results.push(data);
      }
      results.push(data);
    })
    .on('end', () => {
      console.log(results.length);
    // some code that takes a JS object and populates a database
    });
}

readAndPrintCsv('./testData/product.csv');

// * PRODUCT
// # of keys validated

// example data for product
// {
//     id: '100',
//     name: 'Elody Cap',
//     slogan: 'Sequi molestiae eos aut ratione deleniti et omnis officia voluptatem.',
//     description: 'Accusamus et tempore accusamus sunt accusamus aliquam neque esse rerum. Doloremque mollitia qui. Velit quae dolores. Quia et a sed sint. Facilis qui et eligendi. Id reprehenderit rem ullam dolor rerum.',
//     category: 'Cap',
//     default_price: '211'
// }

//* QUESTIONS




// * REVIEWS





