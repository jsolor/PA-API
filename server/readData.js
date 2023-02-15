/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable object-shorthand */
/* eslint-disable no-plusplus */
const fs = require('fs');
const csv = require('csv-parser');
const { closeDB, connectDB } = require('./database');
const { QuestionModel, ProductModel, AnswerModel } = require('./Models/qAndA');

// const NUMBER_OF_QUESTIONS = 3518863;
// const NUMBER_OF_PRODUCT = 1000011;

async function wait(ms) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

// async function splitFileAndSaveToDb() {
//   await connectDB();
//   const file = fs.readFileSync('./testData/product.csv', 'utf8');
//   const lines = file.split('\n');
//   const TOTAL_NUMBER_OF_LINES = 1000011;
//   const NUMBER_OF_LINES_TO_TRY = 200000;
//   const CHUNK_SIZE = 100000;
//   const START_INDEX = 900013;

//   // i starts at 1 so that we skip the header
//   for (let i = START_INDEX; i <= TOTAL_NUMBER_OF_LINES; i++) {
//     // for (let j = i; j < i + CHUNK_SIZE; j++) {
//     lines[i] = lines[i].split(',');
//     const productData = new ProductModel({
//       product_id: lines[i][0],
//       results: [],
//     });
//     productData.save();
//     // }
//     console.log('chunked');
//   }
//   await wait(1000);
//   // closeDB();
// }

// splitFileAndSaveToDb();
// console.log('data finished');

// async function populateProductsWithQuestions() {
//   await connectDB();
//   const file = fs.readFileSync('./testData/answers.csv', 'utf8');
//   const lines = file.split('\n');
//   const TOTAL_NUMBER_OF_LINES = 6879306;
//   const START_INDEX = 1;
//   const CHUNK_SIZE = 100000;
//   for (let i = START_INDEX; i < CHUNK_SIZE; i++) {
//     const data = lines[i].split(',');
//     console.log(JSON.stringify(data));
//   }
// }

// populateProductsWithQuestions();

async function doStuff() {
  await connectDB();
  const questionData = new QuestionModel({
    id: 1,
    question_body: 'body',
    question_date: 2,
    asker_name: 'name',
    asker_email: 'email',
    reported: false,
    question_helpfulness: 5,
    answers: [],
  });

  ProductModel.findOneAndUpdate(
    {
      product_id: 1,
    },
    {
      $push: {
        results: questionData,
      },
    },
  ).then((res) => console.log(res))
    .catch((e) => console.log(e));
}

// doStuff();

async function cleanDb() {
  await connectDB();

  ProductModel.updateMany(
    {},
    {
      $set: {
        results: [],
      },
    },
  ).then((res) => console.log(res))
    .catch((err) => console.log(err));
}

// cleanDb();

async function readAnswersUsingStream() {
  let counter = 0;
  await connectDB();

  const data = [];

  const stream = fs.createReadStream('./testData/questions.csv', { highWaterMark: 128 * 1024 })
    .pipe(csv())
    .on('data', (question) => {
      counter++;
      if (counter % 5000 === 0) {
        console.log(counter);
      }

      if (question.id > 2000000) {
        return;
      }

      const { product_id } = question;

      const questionData = new QuestionModel({
        id: question.id,
        question_body: question.body,
        question_date: question.date_written,
        asker_name: question.asker_name,
        asker_email: question.asker_email,
        reported: question.reported,
        question_helpfulness: question.helpful,
        answers: [],
      });

      const options = {
        updateOne: {
          filter: { product_id: product_id },
          update: {
            $push: {
              results: questionData,
            },
          },
        },
      };

      data.push(options);
    })
    .on('end', async () => {
      console.log(`all the data is: ${data.length}`);
      // const operations = [];

      // for (const question of data) {
      //   const { product_id } = question;

      //   // if (Number(product_id) < 10) {
      //   // console.log(`the product_id is ${product_id}`);

      //   const questionData = new QuestionModel({
      //     id: question.id,
      //     question_body: question.body,
      //     question_date: question.date_written,
      //     asker_name: question.asker_name,
      //     asker_email: question.asker_email,
      //     reported: question.reported,
      //     question_helpfulness: question.helpful,
      //     answers: [],
      //   });

      //   const options = {
      //     updateOne: {
      //       filter: { product_id: product_id },
      //       update: {
      //         $push: {
      //           results: questionData,
      //         },
      //       },
      //     },
      //   };
      //   operations.push(options);

      //   // await ProductModel.findOneAndUpdate(
      //   //   {
      //   //     product_id: product_id,
      //   //   },
      //   //   {
      //   //     $push: {
      //   //       results: questionData,
      //   //     },
      //   //   },
      //   // );
      //   // }
      // if (Number(product_id) % 10000 === 0) {
      //   console.log(`product is: ${product_id}`);
      // }

      // if (Number(product_id) === 1) {
      //   console.log(`the result we are adding is: ${JSON.stringify(
      //     {
      //       id: question.id,
      //       question_body: question.body,
      //       question_date: question.date_written,
      //       asker_name: question.asker_name,
      //       asker_email: question.asker_email,
      //       reported: question.reported,
      //       question_helpfulness: question.helpful,
      //       answers: [],
      //     },
      //   )}`);
      //   console.log('the product id was more than one million and we should find one thing and update it');
      // }

      // find how to push to currently existing data based on query of product_id
      ProductModel.bulkWrite(data, (err, res) => {
        if (err) {
          console.log(`bulk write failed: ${err}`);
        } else if (res) {
          console.log(`bulk write succeeded: ${res}`);
        }
      });
    });

  // ProductModel.bulkWrite(operations.slice(0, 1000), (err, res) => {
  //   if (err) {
  //     console.log(`bulk write failed: ${err}`);
  //   } else if (res) {
  //     console.log(`bulk write succeeded: ${res}`);
  //   }
  // });
  // ProductModel.bulkWrite(operations.slice(1000, 2000), (err, res) => {
  //   if (err) {
  //     console.log(`bulk write failed: ${err}`);
  //   } else if (res) {
  //     console.log(`bulk write succeeded: ${res}`);
  //   }
  // });
  // });
}

// id,product_id,body,date_written,asker_name,asker_email,reported,helpful

readAnswersUsingStream();

// * shape of qAndA data
// {
//   product1:
//   [
//     { question1: [answer1, answer2] },
//     { question1: [answer1, answer2] },
//     { question1: [answer1, answer2] }
//   ],
//   product2: ...
// }
