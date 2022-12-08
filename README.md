
# Exam in Web-Technologies Recipes Database

Exam for the subject Web technology Front-end development second year Gokstad Academy.


## This project

The task we were given was to create a database for recipes. The database must have different accesses to the system. Free user who only has access to certain free recipes, Premium user who has access to and view and search for all recipes and an Admin user who can see all recipes in the database, but who can also add new recipes, update, change and delete recipes from the database.
## Program

- Visual Studio Code
- Node.js
- Postman
- DB Browser for SQLite


## Installation

Install my-project with npm

```bash
  npm install express
  npm install sqlite3
  npm install body-parser
  npm install cookie-parser
  npm install nodemon
```
Express.js, or simply Express, is a back end web application framework for building RESTful APIs with Node.js.

SQLite3 we need to install when we are creating SQLite database.

Body-parser is the Node.js body parsing middleware. It is responsible for parsing the incoming request bodies in a middleware before you handle it.

Cookie Parser is a middleware of Node.js used to get cookie data. To get Cookie data in
Express JS, req. cookies property is used. req. cookies is an object that contains cookies sent
by request in JSON after parsing.

Nodemon is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes.
## Run Locally

const port = process.env.PORT || 8080;

app.listen(port, () => console.log("Server has started on port", port));

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```


## Database

const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(__dirname + "/database.sqlite");

const recipesTable = "recipesdata";

const ingredientsTable = "ingredientsdata";

const stepsTable = "stepsdata";

const CREATE_RECIPES_TABLE = `CREATE TABLE if not exists ${recipesTable} (ID INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, categories TEXT, recipe_id INT, user TEXT);`;

const CREATE_INGREDIENTS_TABLE = `CREATE TABLE if not exists ${ingredientsTable} ( entry TEXT, type TEXT, recipe_id INT);`;

const CREATE_STEPS_TABLE = `CREATE TABLE if not exists ${stepsTable} ( text TEXT, step_id INT, recipe_id INT);`;

I used the program postman to GET and POST recipes from and to my database.
To see what is in the database, I used the program DB Browser for SQLite3.


## API Reference

#### Create tables to the database

```http
  GET /create
```

#### List Recipes

```http
  GET /recipes
```
Get the full recipe from the database

#### Overview of Steps

```http
  GET /recipe/:recipe_id
```
Get the name, ingredient and step count

#### Detailed Steps

```http
  GET /recipe/:recipe_id/all
```
Get the entire entry for the selected recipe

#### Single Step

```http
  GET /recipe/:recipe_id/:step_id
```
Get the selected step from the selected recipe

#### Search by ingredient

```http
  GET /search/:ingredient
```
Get the ingredient and who recipes that use that ingredient

#### Search helper

```http
  GET /ingredients
```
Get all possible ingredients to search for in the database

#### Add recipe

```http
  POST /recipe
```
Send new recipes to the database

#### Update recipe

```http
  PATCH /recipe/:recipe_id
```
Update an existing recipes

#### Replace recipe

```http
  PUT /recipe/:recipe_id
```
Replace an existing recipes

#### Delete recipe

```http
  DELETE /recipe/:recipe_id
```
Delete an existing recipes from the database

