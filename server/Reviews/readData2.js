/* eslint-disable no-await-in-loop */
const fs = require('fs');
const csv = require('csv-stream');
const through2 = require('through2');
const events = require('events');
const readline = require('readline');
const { closeDB, connectDB } = require('./database');
const { ReviewsProductModel, MetaModel, ReviewsModel } = require('./Models/reviews');

async function cleanDb() {
  await connectDB();

  ReviewsProductModel.updateMany(
    {},
    {
      $set: {
        reviews: [],
      },
    },
  ).then((res) => console.log(res))
    .catch((err) => console.log('error:', err));
}

const reviewsLines = [];
async function processLineByLine(path) {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(path),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (reviewsLines.length < 1000000) {
      reviewsLines.push(line);
      console.log(reviewsLines.length);
      } else {
        rl.close();
      }
    });

    await events.once(rl, 'close');

    console.log('Reading file line by line with readline done.');
    // const used = process.memoryUsage().heapUsed / 1024 / 1024;
    return reviewsLines;
  } catch (err) {
    console.error(err);
  }
  // return [];
}

async function populateReviews() {
  await connectDB();

  await processLineByLine('./TestData/reviews.csv');

  // let i = 1;
  let start = 0;
  const batch = 200000;
  let foreignProductId = 0;

  for (let i = start; i < start + batch + 1; i++) {

    if (reviewsLines[i] === undefined) {
      break;
    }

    const line = reviewsLines[i].split(',');
    console.log(i);
    foreignProductId = line[1];

    const review = await new ReviewsModel({
      review_id: Number(line[0]),
      rating: Number(line[2]),
      date: Number(line[3]),
      summary: line[4],
      body: line[5],
      recommend: line[6],
      reported: line[7],
      reviewer_name: line[8],
      reviewer_email: line[9],
      response: line[10],
      helpfulness: Number(line[11]),
      photos: [],
    });

    // console.log(JSON.stringify(review)); // for debugging
    console.log(`foreign key is: ${foreignProductId}`);
    ReviewsProductModel.findOneAndUpdate(
      {
        id: foreignProductId,
      },
      {
        $push: {
          reviews: review,
        },
      },
    ).then((res) => { console.log('added'); })
      .catch((e) => console.log(e));

    // i++;
    if (i === start + batch) {
      await setTimeout(() => {
        start += batch + 1;
        i = start;
        console.log(start, i);
      }, 1000);
    }
  }
  console.log('find and updates have finished');

  // for (let i = START_INDEX; i < END_INDEX; i++) {
  //   const line = reviewsLines[i].split(',');
  //   const foreignProductId = line[1];

  //   const review = new ReviewsModel({
  //     review_id: Number(line[0]),
  //     rating: Number(line[2]),
  //     date: Number(line[3]),
  //     summary: line[4],
  //     body: line[5],
  //     recommend: line[6],
  //     reported: line[7],
  //     reviewer_name: line[8],
  //     reviewer_email: line[9],
  //     response: line[10],
  //     helpfulness: Number(line[11]),
  //     photos: [],
  //   });

  //   // console.log(JSON.stringify(review)); // for debugging
  //   console.log(`foreign key is: ${foreignProductId}`);
  //   ReviewsProductModel.findOneAndUpdate(
  //     {
  //       id: foreignProductId,
  //     },
  //     {
  //       $push: {
  //         reviews: review,
  //       },
  //     },
  //   ).then((res) => console.log(res))
  //     .catch((e) => console.log(e));
  // }
  // console.log('find and updates have finished');
}

// cleanDb();
populateReviews();
