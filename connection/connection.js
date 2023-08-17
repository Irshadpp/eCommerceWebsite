var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database:"flipkart"
  });
  
  con.connect(function(err) {
    if (err){ console.log(err);}
    else{
    console.log("Connected!");
  }
  });
  module.exports = con;