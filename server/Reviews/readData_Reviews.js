/* eslint-disable no-use-before-define */
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

async function readAndPrintCsv(path) {
  await connectDB();
  const stream = fs.createReadStream(path);
  let chunk = [];
  stream
    .pipe(csv.createStream({
      endLine: '\n',
      escapeChar: '"',
      enclosedChar: '"',
    }))
    .pipe(through2({ objectMode: true }, (row, enc, cb) => {
      saveIntoDatabase(row).then(() => {
        cb(null, true);
      })
        .catch((err) => {
          cb(err, null);
        });
    }))
    .on('data', (data) => {
      console.log('saved ', chunk.length);
    })
    .on('end', () => {
      console.log('end');
    })
    .on('error', (err) => {
      console.error(err);
    });
  // Mock function that emulates saving the row into a database,
  // asynchronously in ~500 ms
  const saveIntoDatabase = (row) => {
    row.id = Number.parseInt(row.id, 10);
    if (row.id > 1000000) {
      chunk.push(row);
    }

    // if (chunk.length % 100000 === 0) {
    //   console.log('100000 rows added');
    //   for (const product of chunk) {
    //     const p = new ReviewsProductModel(product);
    //     p.save();
    //   }
    //   chunk = [];
    // }
    if (row.id >= 1000011) {
      for (const product of chunk) {
        const p = new ReviewsProductModel(product);
        p.save();
      }
    }

    return new Promise((resolve, reject) => setTimeout(() => resolve(), 0));
  };
}

// readAndPrintCsv('./TestData/product.csv');

async function readAndWriteCSV(path) {
  await connectDB();
  const stream = fs.createReadStream(path);
  let chunk = [];
  stream
    .pipe(csv.createStream({
      endLine: '\n',
      escapeChar: '"',
      enclosedChar: '"',
    }))
    .pipe(through2({ objectMode: true }, (row, enc, cb) => {
      addToDatabase(row).then(() => {
        cb(null, true);
      })
        .catch((err) => {
          cb(err, null);
        });
    }))
    .on('data', (data) => {
      console.log('saved ', chunk.length);
    })
    .on('end', () => {
      addToDatabase(null);
      console.log('end');
    })
    .on('error', (err) => {
      console.error(err);
    });
  // Mock function that emulates saving the row into a database,
  // asynchronously in ~500 ms
  const addToDatabase = (row) => {
    if (row === null) {
      console.log('Reached end');

      ReviewsProductModel.bulkWrite(chunk, (err, res) => {
        if (err) {
          console.log(`bulk write failed: ${err}`);
        } else if (res) {
          console.log(`bulk write succeeded: ${res}`);
        }
      });
      chunk = [];

      return new Promise((resolve, reject) => setTimeout(() => resolve(), 0));
    }

    row.product_id = Number.parseInt(row.product_id, 10);

    const reviewData = new ReviewsModel({
      review_id: Number(row.review_id),
      rating: row.rating,
      summary: row.summary,
      body: row.body,
      date: Number(row.date),
      recommend: row.recommend,
      photos: [],
      helpfulness: row.helpfulness,
      response: row.response,
      reviewer_name: row.reviewer_name,
    });

    const option = {
      updateOne: {
        filter: { id: row.product_id },
        update: {
          $push: {
            reviews: reviewData,
          },
        },
      },
    };

    chunk.push(option);

    if (chunk.length % 100000 === 0) {
      console.log('100000 rows added');

      ReviewsProductModel.bulkWrite(chunk, (err, res) => {
        if (err) {
          console.log(`bulk write failed: ${err}`);
        } else if (res) {
          console.log(`bulk write succeeded: ${res}`);
        }
      });
      chunk = [];
    }
    return new Promise((resolve, reject) => setTimeout(() => resolve(), 0));
  };
}

// readAndWriteCSV('./TestData/reviews.csv');


async function doStuff() {
  await connectDB();

  const reviewData = new ReviewsModel({
    review_id: 2,
    rating: 4,
    summary: 'asdf',
    body: 'asdf',
    date: 1123,
    recommend: true,
    photos: [],
    helpfulness: 4,
    response: 'test',
    reviewer_name: 'asdf',
  });

  ReviewsProductModel.findOneAndUpdate(
    {
      id: 2,
    },
    {
      // $set: {
      //   reviews: [],
      // },
      $push: {
        reviews: reviewData,
      },
    },
  ).then((res) => console.log('found', res))
    .catch((e) => console.log(e));
}

// doStuff();


async function readAndPrintCsv(path) {
  await connectDB();
  const stream = fs.createReadStream(path);
  let chunk = [];
  stream
    .pipe(csv.createStream({
      endLine: '\n',
      escapeChar: '"',
      enclosedChar: '"',
    }))
    .pipe(through2({ objectMode: true }, (row, enc, cb) => {
      saveIntoDatabase(row).then(() => {
        cb(null, true);
      })
        .catch((err) => {
          cb(err, null);
        });
    }))
    .on('data', (data) => {
      console.log('saved ', chunk.length);
    })
    .on('end', () => {
      console.log('end');
    })
    .on('error', (err) => {
      console.error(err);
    });
  // Mock function that emulates saving the row into a database,
  // asynchronously in ~500 ms
  const saveIntoDatabase = (row) => {
    row.id = Number.parseInt(row.id, 10);
    if (row.id > 1000000) {
      chunk.push(row);
    }

    // if (chunk.length % 100000 === 0) {
    //   console.log('100000 rows added');
    //   for (const product of chunk) {
    //     const p = new ReviewsProductModel(product);
    //     p.save();
    //   }
    //   chunk = [];
    // }
    if (row.id >= 1000011) {
      for (const product of chunk) {
        const p = new ReviewsProductModel(product);
        p.save();
      }
    }

    return new Promise((resolve, reject) => setTimeout(() => resolve(), 0));
  };
}

// readAndPrintCsv('./TestData/product.csv');
// let reviewsObject = {};
async function readReviewsCsv(path) {
  await connectDB();
  const stream = fs.createReadStream(path);
  let chunk = [];
  let page = 0;
  stream
    .pipe(csv.createStream({
      endLine: '\n',
      escapeChar: '"',
      enclosedChar: '"',
    }))
    .pipe(through2({ objectMode: true }, (row, enc, cb) => {
      addToObject(row).then(() => {
        cb(null, true);
      })
        .catch((err) => {
          cb(err, null);
        });
    }))
    .on('data', (data) => {
      if (chunk.length % 1000 === 0) {
        console.log('saved ', chunk.length);
      }
    })
    .on('end', () => {
      addToObject(null).then(() => {
        cb(null, true);
      })
      .catch((err) => {
        cb(err, null);
      });
      console.log('end');
    })
    .on('error', (err) => {
      console.error(err);
    });
  // Mock function that emulates saving the row into a database,
  // asynchronously in ~500 ms
  function iterateChunk(chunk) {
    chunk.forEach((row) => {

      reviewsObject[row.id] = {
        product_id: Number(row.product_id),
        rating: Number(row.rating),
        date: Number(row.date),
        summary: row.summary,
        body: row.body,
        recommend: (row.recommend === 'true'),
        reported: (row.recommend === 'false'),
        reviewer_name: row.reviewer_name,
        reviewer_email: row.reviewer_email,
        response: row.response,
        helpfulness: Number(row.helpfulness)
      }

    })

    function addLine(row) {
      reviewsObject[row.id] = {
        product_id: Number(row.product_id),
        rating: Number(row.rating),
        date: Number(row.date),
        summary: row.summary,
        body: row.body,
        recommend: (row.recommend === 'true'),
        reported: (row.recommend === 'false'),
        reviewer_name: row.reviewer_name,
        reviewer_email: row.reviewer_email,
        response: row.response,
        helpfulness: Number(row.helpfulness)
      }
    }
    // const id = Number(row.id);
    //   console.log(id);

    //   const reviewData = {
    //     product_id: Number(row.product_id),
    //     review_id: Number(row.id),
    //     rating: row.rating,
    //     summary: row.summary,
    //     body: row.body,
    //     date: Number(row.date),
    //     recommend: row.recommend,
    //     photos: [],
    //     helpfulness: row.helpfulness,
    //     response: row.response,
    //     reviewer_name: row.reviewer_name,
    //   };

    //   reviewsObject[id] = reviewData;
    /*
    {
      id: '8985',
      product_id: '1535',
      rating: '5',
      date: '1595538561338',
      summary: 'Quam mollitia adipisci eveniet enim.',
      body: 'Laudantium rerum et rerum rerum quis illum. Sint omnis quam sapiente saepe earum quisquam molestiae. Nisi nostrum ut et placeat dolor saepe.',
      recommend: 'true',
      reported: 'false',
      reviewer_name: 'Shaun_Feest39',
      reviewer_email: 'Lou_Langworth21@hotmail.com',
      response: 'Porro quibusdam quo ut explicabo eaque velit.',
      helpfulness: '13'
    }
    */

  };

  const addToObject = (row) => {

    if (row === null) {

    }
    chunk.push(row);

    if (chunk.length % 100000 === 0) {
      iterateChunk(chunk);
      chunk = [];
    }

    return new Promise((resolve, reject) => setTimeout(() => resolve(), 0));
  };
}

// readReviewsCsv('./TestData/reviews.csv');

// function addLine(row) {
//   reviewsObject[row.id] = {
//     product_id: Number(row.product_id),
//     rating: Number(row.rating),
//     date: Number(row.date),
//     summary: row.summary,
//     body: row.body,
//     recommend: (row.recommend === 'true'),
//     reported: (row.recommend === 'false'),
//     reviewer_name: row.reviewer_name,
//     reviewer_email: row.reviewer_email,
//     response: row.response,
//     helpfulness: Number(row.helpfulness)
//   }
// };

// let reviewsObject = {};

//--------------------------------------------------

function populateReviews(reviews) {

  await connectDB();

  console.log('starting: ');

  let chunk = [];

  reviews.forEach((line) => {
    line = line.split(',');
    const product_id = Number(line[1]);
    console.log(line);

    const reviewData = new ReviewsModel({
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

    const option = {
      updateOne: {
        filter: { id: product_id },
        update: {
          $push: {
            reviews: reviewData,
          },
        },
      },
    };

    chunk.push(option);

    if (chunk.length % 50000 === 0) {
      console.log('adding to DB - 50K reached')
      ReviewsProductModel.bulkWrite(chunk, (err, res) => {
        if (err) {
          console.log(`bulk write failed: ${err}`);
        } else if (res) {
          console.log(`bulk write succeeded: ${res}`);
        }
      });
      chunk = [];
    }
  });

};

const addToDatabase = (line) => {

  if (line === null) {
    console.log('Reached end');

    ReviewsProductModel.bulkWrite(chunk, (err, res) => {
      if (err) {
        console.log(`bulk write failed: ${err}`);
      } else if (res) {
        console.log(`bulk write succeeded: ${res}`);
      }
    });
    chunk = [];

    return new Promise((resolve, reject) => setTimeout(() => resolve(), 0));
  };

  let row = line.split(',');

  const reviewData = new ReviewsModel({
    id: row.id,
    product_id: Number(row.product_id),
    rating: Number(row.rating),
    date: Number(row.date),
    summary: row.summary,
    body: row.body,
    recommend: (row.recommend === 'true'),
    reported: (row.recommend === 'false'),
    reviewer_name: row.reviewer_name,
    reviewer_email: row.reviewer_email,
    response: row.response,
    helpfulness: Number(row.helpfulness),
    photos: [],
  });

  const option = {
    updateOne: {
      filter: { id: Number(row.product_id) },
      update: {
        $push: {
          reviews: reviewData,
        },
      },
    },
  };

  chunk.push(option);

  if (chunk.length % 100000 === 0) {
    console.log('100000 rows added');

    ReviewsProductModel.bulkWrite(chunk, (err, res) => {
      if (err) {
        console.log(`bulk write failed: ${err}`);
      } else if (res) {
        console.log(`bulk write succeeded: ${res}`);
      }
    });
    chunk = [];
  }
  return new Promise((resolve, reject) => setTimeout(() => resolve(), 0));
};



async function processLineByLine(path) {
  await connectDB();
  let reviewsLines = [];
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(path),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      reviewsLines.push(line);
      console.log(reviewsLines.length);
    });

    await events.once(rl, 'close');

    console.log('Reading file line by line with readline done.');
    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    populateReviews(reviewsLines);
  } catch (err) {
    console.error(err);
  }

};

// cleanDb();

processLineByLine('./TestData/reviews.csv');


// console.log(reviewsObject[1000000]);

async function splitFileAndSaveToDb() {
  await connectDB();
  const productsFile = fs.readFileSync('./testData/product.csv', 'utf8');
  const reviewsFile = fs.readFileSync('./testData/reviews.csv', 'utf8', { highWaterMark: 128 * 1024 });
  const photosFile = fs.readFileSync('./testData/reviews_photos.csv', 'utf8');
  const c15File = fs.readFileSync('./testData/characteristics.csv', 'utf8');
  const c15ReviewsFile = fs.readFileSync('./testData/characteristic_reviews.csv', 'utf8');

  const products = productsFile.split('\n');
  // const reviews = reviewsFile.split('\n');
  const photos = photosFile.split('\n');
  const c15 = c15File.split('\n');
  const c15Reviews = c15ReviewsFile.split('\n');

  // Parse reviews in characteristics
  const c15Object = {};
  c15.forEach((line) => {
    line = line.split(',');
    const product = line[1];
    const id = Number(line[0]);
    const name = line[2].slice(1, -1);

    if (c15Object[product]) {
      c15Object[product].characteristics[name] = { id, value: null };
    } else {
      c15Object[product] = { product_id: Number(product), characteristics: {} };
      c15Object[product].characteristics = {};
    }
  });

  c15 = [];
  c15File = null;
  c15ReviewsObject = {};

  c15Reviews.forEach((line) => {
    line = line.split(',');
    char_id = Number(line[1]);
    id = Number(line[0]);
    review = Number(line[2]);
    value = Number(line[3]);

  })


  console.log(c15Object[1000000]);
}

// splitFileAndSaveToDb();


console.log('data finished');

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


