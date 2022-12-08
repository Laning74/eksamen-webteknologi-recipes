const sqlite3 = require("sqlite3");

const express = require("express");
const bodyParser = require("body-parser");
const port = process.env.PORT || 8080;
const app = express();
const cookieParser = require("cookie-parser");

app.use(bodyParser.json());
app.use(cookieParser());

//connect to database
const db = new sqlite3.Database(__dirname + "/database.sqlite");

// Create table - SQLite database

const recipesTable = "recipesdata";
const ingredientsTable = "ingredientsdata";
const stepsTable = "stepsdata";

const CREATE_RECIPES_TABLE = `CREATE TABLE if not exists ${recipesTable} (ID INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, categories TEXT, recipe_id INT, user TEXT);`;
const DROP_TABLE = `DROP TABLE if exists ${recipesTable}`;

const CREATE_INGREDIENTS_TABLE = `CREATE TABLE if not exists ${ingredientsTable} ( entry TEXT, type TEXT, recipe_id INT);`;
// const DROP_TABLE = `DROP TABLE if exists ${ingredientsTable}`;

const CREATE_STEPS_TABLE = `CREATE TABLE if not exists ${stepsTable} ( text TEXT, step_id INT, recipe_id INT);`;
// const DROP_TABLE = `DROP TABLE if exists ${stepsTable}`;

app.get("/create", (req, res) => {
  db.run(CREATE_RECIPES_TABLE);
  res.send("Table created!");
});

app.get("/create", (req, res) => {
  db.run(CREATE_INGREDIENTS_TABLE);
  res.send("Table created!");
});

app.get("/create", (res) => {
  db.run(CREATE_STEPS_TABLE);
  res.send("Table created!");
});

app.get("/drop", (res) => {
  db.run(DROP_TABLE);
  res.send("Table dropped");
});

// FT01 - List Recipes:
// app.get("/recipes", (req, res) => {
//   let recipes = [];

//   db.serialize(() => {
//     if (
//       req.cookies.user_type === "premium" ||
//       req.cookies.user_type === "admin"
//     ) {
//       db.each(
//         `SELECT name FROM ${recipesTable}`,

//         (err, row) => {
//           if (err) {
//             res.status(404).json({ Error: "An error occured" });
//           } else recipes.push(row);
//         },
//         () => {
//           res.send(recipes);
//         }
//       );
//     } else {
//       db.each(
//         `SELECT name FROM ${recipesTable} WHERE user = "Free"`,

//         (err, row) => {
//           if (err) {
//             res.status(404).json({ Error: "An error occured" });
//           } else recipes.push(row);
//         },
//         () => {
//           res.send(recipes);
//         }
//       );
//     }
//   });
// });

// FT02 - Overview of Steps:
app.get("/recipe/:recipe_id", (req, res) => {
  let recipesName = [];
  let ingredientsData = [];
  let step_cout = [];

  db.serialize(() => {
    if (
      req.cookies.user_type === "premium" ||
      req.cookies.user_type === "admin"
    ) {
      db.each(
        `SELECT name FROM ${recipesTable} WHERE recipe_id = ?`,
        [req.params.recipe_id],
        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipesName.push(row);
        }
      );
      db.each(
        `SELECT ${ingredientsTable}.entry, ${ingredientsTable}.type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${ingredientsTable}.recipe_id WHERE ${ingredientsTable}.recipe_id = ?`,
        [req.params.recipe_id],

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else ingredientsData.push(row);
        }
      );
      db.each(
        `SELECT ${stepsTable}.step_id FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${stepsTable}.recipe_id WHERE ${recipesTable}.recipe_id = ?`,
        [req.params.recipe_id],

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else step_cout.push(row);
        },

        () => {
          res.json({
            Recipes: recipesName,
            Ingredients: ingredientsData,
            Step_cout: step_cout.length,
          });
        }
      );
    } else {
      db.each(
        `SELECT name FROM ${recipesTable} WHERE recipe_id = ? AND ${recipesTable}.user = "Free"`,
        [req.params.recipe_id],
        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipesName.push(row);
        }
      );
      db.each(
        `SELECT ${ingredientsTable}.entry, ${ingredientsTable}.type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${ingredientsTable}.recipe_id WHERE ${ingredientsTable}.recipe_id = ? AND ${recipesTable}.user = "Free"`,
        [req.params.recipe_id],

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else ingredientsData.push(row);
        }
      );
      db.each(
        `SELECT ${stepsTable}.step_id FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${stepsTable}.recipe_id WHERE ${recipesTable}.recipe_id = ? AND ${recipesTable}.user = "Free"`,
        [req.params.recipe_id],

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else step_cout.push(row);
        },

        () => {
          res.json({
            Recipes: recipesName,
            Ingredients: ingredientsData,
            Step_cout: step_cout.length,
          });
        }
      );
    }
  });
});

// FT03 - Detailed Steps:
app.get("/recipe/:recipe_id/all", (req, res) => {
  let recipesName = [];
  let ingredientsData = [];
  let steps = [];

  db.serialize(() => {
    if (
      req.cookies.user_type === "premium" ||
      req.cookies.user_type === "admin"
    ) {
      db.each(
        `SELECT name FROM ${recipesTable} WHERE recipe_id = ?`,
        [req.params.recipe_id],
        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipesName.push(row);
        }
      );
      db.each(
        `SELECT ${ingredientsTable}.entry, ${ingredientsTable}.type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${ingredientsTable}.recipe_id WHERE ${ingredientsTable}.recipe_id = ?`,
        [req.params.recipe_id],

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else ingredientsData.push(row);
        }
      );
      db.each(
        `SELECT ${stepsTable}.step_id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${stepsTable}.recipe_id WHERE ${stepsTable}.recipe_id = ?`,
        [req.params.recipe_id],

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else steps.push(row);
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
        `SELECT name FROM ${recipesTable} WHERE recipe_id = ? AND ${recipesTable}.user = "Free"`,
        [req.params.recipe_id],
        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipesName.push(row);
        }
      );
      db.each(
        `SELECT ${ingredientsTable}.entry, ${ingredientsTable}.type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${ingredientsTable}.recipe_id WHERE ${ingredientsTable}.recipe_id = ? AND ${recipesTable}.user = "Free"`,
        [req.params.recipe_id],

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else ingredientsData.push(row);
        }
      );
      db.each(
        `SELECT ${stepsTable}.step_id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${stepsTable}.recipe_id WHERE ${stepsTable}.recipe_id = ? AND ${recipesTable}.user = "Free"`,
        [req.params.recipe_id],

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else steps.push(row);
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

// FT04 - SingleStep:
app.get("/recipe/:recipe_id/:step_id", (req, res) => {
  let recipes_detail = [];

  db.serialize(() => {
    if (
      req.cookies.user_type === "premium" ||
      req.cookies.user_type === "admin"
    ) {
      db.each(
        `SELECT ${stepsTable}.step_id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${stepsTable}.recipe_id WHERE ${stepsTable}.recipe_id = ? AND ${stepsTable}.step_Id = ?`,
        [req.params.recipe_id, req.params.step_id],

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipes_detail.push(row);
        },

        () => {
          res.json({
            recipes_detail,
          });
        }
      );
    } else {
      db.each(
        `SELECT ${stepsTable}.step_id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${stepsTable}.recipe_id WHERE ${stepsTable}.recipe_id = ? AND ${stepsTable}.step_id = ? AND ${recipesTable}.user = "Free"`,
        [req.params.recipe_id, req.params.step_id],

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipes_detail.push(row);
        },

        () => {
          res.json({
            recipes_detail,
          });
        }
      );
    }
  });
});

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
        recipesName.push(row);
      }),
        db.each(
          `SELECT ${ingredientsTable}.entry, ${ingredientsTable}.type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${ingredientsTable}.recipe_id`,

          (err, row) => {
            if (err) {
              res.status(404).json({ Error: "An error occured" });
            } else ingredientsData.push(row);
          }
        ),
        db.each(
          `SELECT ${stepsTable}.step_id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${stepsTable}.recipe_id`,

          (err, row) => {
            if (err) {
              res.status(404).json({ Error: "An error occured" });
            } else steps.push(row);
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
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipesName.push(row);
        }
      );
      db.each(
        `SELECT ${ingredientsTable}.entry, ${ingredientsTable}.type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${ingredientsTable}.recipe_id WHERE ${recipesTable}.user = "Free"`,

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else ingredientsData.push(row);
        }
      );
      db.each(
        `SELECT ${stepsTable}.step_id, ${stepsTable}.text FROM ${stepsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${stepsTable}.recipe_id WHERE ${recipesTable}.user = "Free"`,

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else steps.push(row);
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
app.post("/premium", (req, res) => {
  res.cookie("user_type", req.body.user_type);

  res.send("Added Premium Cookie!");
});

// PT02 - Search by Ingredients:
app.get("/search/:ingredient", (req, res) => {
  let recipesIngredient = [];

  db.serialize(() => {
    if (
      req.cookies.user_type === "premium" ||
      req.cookies.user_type === "admin"
    ) {
      db.each(
        `SELECT type, recipe_id FROM ${ingredientsTable} WHERE type LIKE ? `,
        [req.params.ingredient],
        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipesIngredient.push(`"recipes:"${row.recipe_id}`);
        },
        () => {
          res.json({
            search: (recipes = req.params.ingredient),
            result: recipesIngredient,
          });
        }
      );
    } else {
      db.each(
        `SELECT type FROM ${ingredientsTable} WHERE type LIKE ? INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${ingredientsTable}.recipe_id WHERE ${recipesTable}.user = "Free"`,
        [req.params.ingredient],
        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipesIngredient.push(row);
        },
        () => {
          res.send(
            "You must have a premium abonement to search for ingredients "
          );
        }
      );
    }
  });
});

// PT03 - Search helper:
app.get("/ingredient", (req, res) => {
  let recipesIngredient = [];

  db.serialize(() => {
    if (
      req.cookies.user_type === "premium" ||
      req.cookies.user_type === "admin"
    ) {
      db.each(
        `SELECT type FROM ${ingredientsTable}`,

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipesIngredient.push(row);
        },
        () => {
          res.json({
            result: recipesIngredient,
          });
        }
      );
    } else {
      db.each(
        `SELECT type FROM ${ingredientsTable} INNER JOIN ${recipesTable} ON ${recipesTable}.recipe_id = ${stepsTable}.recipe_id WHERE ${recipesTable}.user = "Free"`,

        (err, row) => {
          if (err) {
            res.status(404).json({ Error: "An error occured" });
          } else recipesIngredient.push(row);
        },
        () => {
          res.send(
            "You must have a premium abonement to see ingredients in recipes"
          );
        }
      );
    }
  });
});

// PT04 - Minimun number of premium - Search helper:
// This i cheeck with cookie on FT05 Free...

// Usage Scenario - Administrator:
// AT01 - Administrator Token:

app.post("/admin", (req, res) => {
  res.cookie("user_type", req.body.user_type);

  res.send("Added Admin Cookie!");
});

// AT02 - Add Recipe:

app.post("/recipe", (req, res) => {
  db.serialize(() => {
    if (req.cookies.user_type === "admin") {
      db.run(
        `INSERT INTO ${recipesTable} (name, categories, recipe_id, user) VALUES ('Pai',  'Lunsj', 7, 'Premium/Admin');`
      );
      db.run(
        `INSERT INTO ${ingredientsTable} (entry, type, recipe_id) VALUES ('3 egg',  'Egg', 7 );`
      );
      db.run(
        `INSERT INTO ${stepsTable} ( text, step_id, recipe_id) VALUES ('Legg en ferdig paideig i en paiform, og hell over ønsket eggeblanding med fyll', 1, '7');`
      );

      res.send("New recipes to the databse added!");
    } else res.send("You must be Admin to add new recipes");
  });
});

// AT03 - Update Recipe:(not working correctly)

// app.patch("/recipes/:recipes_Id", (req, res) => {
//   let dataRecipesTable = [];
//   let dataIngredientsTable = [];
//   let dataStepsTable = [];
//   db.serialize(() => {
//     db.each(
//       `UPDATE ${recipesTable} (name, categories) VALUES ('Omelett',  'Frokost') WHERE recipes_Id = ?`[
//         req.params.recipes_Id
//       ],

//       (err, row) => {
//         dataRecipesTable.push(row);
//       }
//     );
//     db.each(
//       `UPDATE ${ingredientsTable} (entry, type) VALUES ('1 l melk', 'Melk') WHERE recipes_Id = ?`[
//         req.params.recipes_Id
//       ],

//       (err, row) => {
//         dataIngredientsTable.push(row);
//       }
//     );

//     db.each(
//       `UPDATE ${stepsTable} (text) VALUES ('Bland egg og melk og stek på middels varme') WHERE recipes_Id = ?'`[
//         req.params.recipes_Id
//       ],

//       (err, row) => {
//         dataStepsTable.push(row);
//       }
//     );

//     () => {
//       res.json({
//         name: dataRecipesTable,
//         ingredients: dataIngredientsTable,
//         steps: dataStepsTable,
//       });
//     };
//   });
// });

// AT04 - Replace Recipe: (not working correctly)

app.put("/recipes/:recipe_id", (req, res) => {
  db.serialize(() => {
    db.run(
      `UPDATE ${recipesTable} VALUES (name, categories, recipe_id, user) VALUES ('Omelett',  'Frokost', 7, 'Premium/Admin');`
    );
    db.run(
      `UPDATE ${ingredientsTable} VALUES (entry, type, recipe_id) VALUES ('5 egg',  'Egg', 7 );`
    );
    db.run(
      `UPDATE ${stepsTable} VALUES (text, step_id, recipe_id) VALUES ('Rør sammen egg med ønsket innhold og stek på middels varme', 1, '7');`
    );

    res.send("Recipe are updated!");
  });
});

// AT05 - Delete Recipes: (not working correctly)

app.delete("/recipe/:recipe_id", (req, res) => {
  db.serialize(() => {
    if (req.cookies.user_type === "admin") {
      db.each(
        `DELETE FROM ${recipesTable} WHERE recipe_id = ?`[req.params.recipe_id]
      );
      db.each(`DELETE FROM ${ingredientsTable} WHERE recipe_id = ?`);
      [req.params.recipe_id],
        db.each(`DELETE FROM ${stepsTable} WHERE recipe_id = ?`);
      [req.params.recipe_id], res.send("Recipe deleted!");
    } else res.send("You must be Admin to delete recipes");
  });
});

app.listen(port, () => console.log("Server has started on port", port));
