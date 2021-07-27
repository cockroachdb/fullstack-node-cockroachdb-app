//Setup Express
 
const express = require('express') //Set up our main function variable for calling the Express module and require it as a dependency
const app = express() //Object returned by express() 
 
 
//Port and host for Heroku
//const port = process.env.PORT;
//const host = '0.0.0.0';

//localhost
const port = 3003;
const host = '127.0.0.1';


//Call body-parser for POST data handling
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
 
//CockroachDB
const Sequelize = require("sequelize-cockroachdb");
 
// For secure connection to CockroachDB
const fs = require('fs');
 
// Connect to CockroachDB through Sequelize
var sequelize = new Sequelize({
    dialect: "postgres",
    username: "amruta",
    password: "testtesttest",
    host: "free-tier.gcp-us-central1.cockroachlabs.cloud",
    port: 26257,
    database: "amruta-test-2441.contacts",
    dialectOptions: {
      ssl: {
        
        //For secure connection:
        //ca: fs.readFileSync('$HOME/Library/CockroachCloud/certs/cc-ca.crt')
          //      .toString()
      },
    },
    logging: false, 
  });
 
//Define the table we'll be working with in CockroachDB
 
const People = sequelize.define("people", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true, 
        primaryKey: true,
    },
    name: {
        type: Sequelize.TEXT,
    },
    phoneNumber: {
        type: Sequelize.INTEGER,
    },
});
 
 
//Set up our PUG templates
 
app.set('views', './views');
app.set('view engine', 'pug');
 
//Render our index page where users can submit contact info
 
app.get('/', (req, res) => {
    res.render('index');
});
 
//Create a page that lists our contacts already in the database
 
app.get('/list', (req, res) => {
 
    //Get our data from CockroachDB
    People.sync({
         force:false,
    })
    .then(function() {
       return People.findAll();
    })
        
    .then(function (people) {
        //Render output from CockroachDB using our PUG template
        res.render('list', { people : people });
    })
 
});
 
 
//Handle submitted form data
 
app.post('/submit', function (req, res) {
 
    //Get our values submitted from the form
    var fromName = req.body.name;
    var fromPhone = req.body.phone;
 
    //Add our POST data to CockroachDB via Sequelize
    People.sync({
        force: false,
    })
        .then(function () {
        // Insert new data into People table
        return People.bulkCreate([
            {
            name: fromName,
            phoneNumber: fromPhone,
            },
        ]);
        })
    
        .catch(function (err) {
        console.error("error: " + err.message);
        });    
        
        //Tell them it was a success
        res.send('Submitted Successfully!<br /> Name:  ' + fromName + '<br />Phone:  ' + fromPhone);
});
 
//Output to console
app.listen(port, host, () => {
    console.log(`Server started at ${host} port ${port}`);
});
