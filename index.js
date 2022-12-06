const sqlite3 = require("sqlite3");

const express = require("express");
const bodyParser = require("body-parser");
const port = process.env.PORT || 8080;
const app = express();
const cookieParser = require("cookie-parser");

// const COOKIE_SECRET = "dashldhe128ewhgcvasdy7et2hvhwytt2";

app.use(bodyParser.json());
app.use(cookieParser());
//connect to database
const db = new sqlite3.Database(__dirname + "/database.sqlite");

// sessionID -> username
// const SESSIONS = {};

// temporary database
// user_type = premium;

// Create table - SQLite database

const recipesTable = "recipesdata";
const ingredientsTable = "ingredientsdata";
const stepsTable = "stepsdata";
let user = "Free";

// const CREATE_RECIPES_TABLE = `CREATE TABLE if not exists ${recipesTable} (ID INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, categories TEXT, recipes_Id INT, user TEXT);`;
// const DROP_TABLE = `DROP TABLE if exists ${recipesTable}`;

// const CREATE_INGREDIENTS_TABLE = `CREATE TABLE if not exists ${ingredientsTable} ( entry TEXT, type TEXT, recipes_Id INT);`;
// const DROP_TABLE = `DROP TABLE if exists ${ingredientsTable}`; */

const CREATE_STEPS_TABLE = `CREATE TABLE if not exists ${stepsTable} ( ID INT, text TEXT, step_Id INT, recipes_Id INT);`;
const DROP_TABLE = `DROP TABLE if exists ${stepsTable}`;

// app.get("/create", (req, res) => {
//   db.run(CREATE_RECIPES_TABLE);
//   res.send("Table created!");
// });

// app.get("/create", (req, res) => {
//   db.run(CREATE_INGREDIENTS_TABLE);
//   res.send("Table created!");
// });

app.get("/create", (req, res) => {
  db.run(CREATE_STEPS_TABLE);
  res.send("Table created!");
});

app.get("/drop", (req, res) => {
  db.run(DROP_TABLE);
  res.send("Table dropped");
});

// FT01 - List Recipes:
// app.get("/recipes", (req, res) => {
//   let recipes = [];

//   db.serialize(() => {
//     db.each(
//       `SELECT name FROM ${recipesTable} WHERE user = "Free"`,

//       (err, row) => {
//         recipes.push(`name: ${row.name}`);
//         console.log(row);
//       },
//       () => {
//         res.send(recipes);
//       }
//     );
//   });
// });

// FT02 - Overview of Steps:
app.get("/recipes/:recipes_Id", (req, res) => {
  let recipesName = [];
  let ingredientsData = [];
  let step_cout = [];

  if ((req.cookies.user_type === "premium") !== true)
    db.serialize(() => {
      db.each(
        `SELECT name FROM ${recipesTable} WHERE recipes_Id = ?`,
        [req.params.recipes_Id],
        (err, row) => {
          recipesName.push(`name: ${row.name}`);
        }
      );
      db.each(
        `SELECT ${ingredientsTable}.entry, ${ingredientsTable}.type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipes_Id = ${ingredientsTable}.recipes_Id WHERE ${ingredientsTable}.recipes_Id = ?`,
        [req.params.recipes_Id],

        (err, row) => {
          ingredientsData.push(`entry: ${row.entry}`);
          ingredientsData.push(`type: ${row.type}`);
        }
      );
      db.each(
        `SELECT ${stepsTable}.step_Id FROM ${stepsTable} INNER JOIN ${ingredientsTable} ON ${stepsTable}.ID = ${ingredientsTable}.recipes_Id WHERE ${stepsTable}.recipes_Id = ?`,
        [req.params.recipes_Id],

        (err, row) => {
          step_cout.push(`step_Id:${row.step_Id}`);
        },

        () => {
          res.json({
            name: recipesName,
            ingredients: ingredientsData,
            steps: step_cout,
          });
        }
      );
    });
});

// FT03 - Detailed Steps:
app.get("/recipes/:recipes_Id/all", (req, res) => {
  let recipesName = [];
  let ingredientsData = [];
  let steps = [];

  db.serialize(() => {
    db.each(
      `SELECT name FROM ${recipesTable} WHERE recipes_Id = ?`,
      [req.params.recipes_Id],
      (err, row) => {
        recipesName.push(`name: ${row.name}`);
      }
    );
    db.each(
      `SELECT ${ingredientsTable}.entry, ${ingredientsTable}.type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipes_Id = ${ingredientsTable}.recipes_Id WHERE ${ingredientsTable}.recipes_Id = ?`,
      [req.params.recipes_Id],

      (err, row) => {
        ingredientsData.push(`entry: ${row.entry}`);
        ingredientsData.push(`type: ${row.type}`);
      }
    );
    db.each(
      `SELECT ${stepsTable}.step_Id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipes_Id = ${stepsTable}.recipes_Id WHERE ${stepsTable}.recipes_Id = ?`,
      [req.params.recipes_Id],

      (err, row) => {
        steps.push(`step_Id:${row.step_Id}`);
        steps.push(`text:${row.text}`);
      },

      () => {
        res.json({
          name: recipesName,
          ingredients: ingredientsData,
          steps: steps,
        });
      }
    );
  });
});

// FT04 - SingleStep:
app.get("/recipes/:recipes_Id/:step_Id", (req, res) => {
  let recipes_detail = [];

  db.serialize(() => {
    if (
      req.cookies.user_type === "premium" ||
      req.cookies.user_type === "admin"
    ) {
      db.each(
        `SELECT ${stepsTable}.step_Id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipes_Id = ${stepsTable}.recipes_Id WHERE ${stepsTable}.recipes_Id = ? AND ${stepsTable}.step_Id = ?`,
        [req.params.recipes_Id, req.params.step_Id],

        (err, row) => {
          recipes_detail.push(`step_Id:${row.step_Id}`);
          recipes_detail.push(`text:${row.text}`);
        },

        () => {
          res.send(recipes_detail);
        }
      );
    } else {
      db.each(
        `SELECT ${stepsTable}.step_Id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipes_Id = ${stepsTable}.recipes_Id WHERE ${stepsTable}.recipes_Id = ? AND ${stepsTable}.step_Id = ? AND ${recipesTable}.user = "Free"`,
        [req.params.recipes_Id, req.params.step_Id],

        (err, row) => {
          recipes_detail.push(`step_Id:${row.step_Id}`);
          recipes_detail.push(`text:${row.text}`);
        },

        () => {
          res.send(recipes_detail);
        }
      );
    }
  });
});

// FT04 - SingleStep:
// app.get("/recipes/:recipes_Id/:step_Id", (req, res) => {
//   let recipes_detail = [];
//   //   if(cookie === "premium || cookie === "admin") {}

//   if ((req.cookies.user_type === "premium") !== true) {
//     db.serialize(() => {
//       db.each(
//         `SELECT step_Id, text FROM ${stepsTable} WHERE recipes_Id =${req.params.recipes_Id} AND step_Id =${req.params.step_Id}`,

//         (err, row) => {
//           recipes_detail.push(`step_Id:${row.step_Id}`);
//           recipes_detail.push(`text:${row.text}`);

//           console.log(row);
//         },

//         () => {
//           res.send(recipes_detail);
//         }
//       );
//     });
//   } else {
//     db.serialize(() => {
//       db.each(
//         `SELECT ${stepsTable}.step_Id, ${stepsTable}.text FROM ${stepsTable} ${recipesTable}.recipes_Id FROM ${recipesTable} WHERE recipes_Id =${req.params.recipes_Id} AND step_Id =${req.params.step_Id} AND ${recipesTable}.user = "Free"`,

//         (err, row) => {
//           recipes_detail.push(`step_Id:${row.step_Id}`);
//           recipes_detail.push(`text:${row.text}`);

//           console.log(row);
//         },

//         () => {
//           res.send(recipes_detail);
//         }
//       );
//     });
//   }
// });

// FT05 - Minimum number of free recipes:
app.get("/recipes", (req, res) => {
  let recipesName = [];
  let ingredientsData = [];
  let steps = [];

  db.serialize(() => {
    if (
      req.cookies.user_type === "premium" ||
      req.cookies.user_type === "admin"
    ) {
      db.each(`SELECT name, categories FROM ${recipesTable}`, (err, row) => {
        recipesName.push(`name: ${row.name}`);
        recipesName.push(`category: ${row.categories}`);
      }),
        db.each(
          `SELECT ${ingredientsTable}.entry, ${ingredientsTable}.type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipes_Id = ${ingredientsTable}.recipes_Id`,

          (err, row) => {
            ingredientsData.push(row);
            // ingredientsData.push(`type: ${row.type}`);
          }
        ),
        db.each(
          `SELECT ${stepsTable}.step_Id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipes_Id = ${stepsTable}.recipes_Id`,

          (err, row) => {
            steps.push(`step_Id:${row.step_Id}`);
            steps.push(`text:${row.text}`);
          },
          () => {
            res.json({
              name: recipesName,
              ingredients: ingredientsData,
              steps: steps,
            });
          }
        );
    } else {
      db.each(
        `SELECT name, categories FROM ${recipesTable} WHERE user = "Free"`,

        (err, row) => {
          recipesName.push(`name: ${row.name}`);
          recipesName.push(`category: ${row.categories}`);
        }
      );
      db.each(
        `SELECT ${ingredientsTable}.entry, ${ingredientsTable}.type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipes_Id = ${ingredientsTable}.recipes_Id WHERE ${recipesTable}.user = "Free"`,

        (err, row) => {
          ingredientsData.push(row);
          //   ingredientsData.push(`type: ${row.type}`);
        }
      );
      db.each(
        `SELECT ${stepsTable}.step_Id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipes_Id = ${stepsTable}.recipes_Id WHERE ${recipesTable}.user = "Free"`,

        (err, row) => {
          steps.push(`step_Id:${row.step_Id}`);
          steps.push(`text:${row.text}`);

          //   console.log(row);
        },

        () => {
          res.json({
            name: recipesName,
            ingredients: ingredientsData,
            steps: steps,
          });
        }
      );
    }
  });
});

// USER PREMIUM:

// PT01 - Premium Cookie:
app.post("/login", (req, res) => {
  res.cookie("user_type", req.body.user_type);

  res.send("Added Cookie!");
});

// PT02 - Search by Ingredients:
app.get("/search/:ingredient", (req, res) => {
  let recipesIngredient = [];

  //   if ((req.cookies.user_type === "premium") !== true)
  db.serialize(() => {
    db.each(
      `SELECT type FROM ${ingredientsTable} WHERE type LIKE ?`,
      [req.params.ingredient],
      (err, row) => {
        recipesIngredient.push(`search: ${row.type}`);
        console.log(row);
      },
      () => {
        res.json({
          result: recipesIngredient,
        });
      }
    );
  });
});

// PT02 - Search by Ingredients:
app.get("/search/:ingredient", (req, res) => {
  let recipesIngredient = [];

  //   if ((req.cookies.user_type === "premium") !== true)
  db.serialize(() => {
    db.each(
      `SELECT type FROM ${ingredientsTable} WHERE type LIKE ?`,
      [req.params.ingredient],
      (err, row) => {
        recipesIngredient.push(`search: ${row.type}`);
        console.log(row);
      },
      () => {
        res.json({
          result: recipesIngredient,
        });
      }
    );
  });
});

app.listen(port, () => console.log("Server has started on port", port));
