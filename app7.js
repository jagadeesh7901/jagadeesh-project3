//CURD operations of students table of school database
/*
1. Initialize PROJECT
>npm init -y
The above command will initialize the project and will 
create a file package.json

2. >npm install express mysql8
Install express mysql8 in current folder

EXECUTION: To open index.html
GET http://localhost:3000/
*/
const express = require("express");
const mysql = require("mysql8");
const app = express();
app.use(express.json());
// Read HTML files from public folder
app.use(express.static("public"));

//Connection establishment with school database
const db = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "Jaga@123",
    database: "school"
});

db.connect((err)=>{
    if(err)
        throw err;
    console.log("Connected to MySQL");
});

// Add the two new columns if they do not already exist.
function ensureStudentColumn(columnName, columnDefinition, callback) {
    db.query("SHOW COLUMNS FROM student LIKE ?", [columnName], (err, rows) => {
        if (err) return callback(err);
        if (rows.length > 0) return callback();
        db.query(`ALTER TABLE student ADD COLUMN ${columnName} ${columnDefinition}`, callback);
    });
}

//TO GET DETAILS OF ALL STUDENTS
app.get("/students",(req,res)=>{

    db.query(
        "SELECT * FROM student",
        (err,result)=>{

            if(err) throw err;

            res.json(result);

        });

});
//TO GET THE DETAILS OF ONE STUDENT
app.get("/students/:sno",(req,res)=>{

    db.query(
        "SELECT * FROM student WHERE student_id=?",
        [req.params.sno],
        (err,result)=>{

            if(err) throw err;

            res.json(result);

        });

});

//TO INSERT STUDENT DATA INTO students TABLE
app.post("/students",(req,res)=>{
        const {sno,name,total,phone,age}=req.body;
    db.query(
        "INSERT INTO student(student_id,student_name,total,phone,age) VALUES(?,?,?,?,?)",
        [sno,name,total,phone,age],
        (err)=>{
            if(err)
            {   res.status(500).send(err.message);
                return;
            }
            res.send("Student Inserted");
        });

});

//TO UPDATE STUDENT DETAILS
app.put("/students/:sno",(req,res)=>{

    const {name,total,phone,age}=req.body;

    db.query(
        "UPDATE student SET student_name=?, total=?, phone=?, age=? WHERE student_id=?",
        [name,total,phone,age,req.params.sno],
        (err,result)=>{

            if(err)
            {
                res.status(500).send(err.message);
                return;
            }

            if(result.affectedRows==0)
                res.status(404).send("Student NOT found");
            else
                res.send("Student Updated");

        });

});

//TO DELETE STUDENT DETAILS
app.delete("/students/:sno",(req,res)=>{

    db.query(
        "DELETE FROM student WHERE student_id=?",
        [req.params.sno],
        (err,result)=>{
            if(err)
            {
                res.status(500).send(err.message);
                return;
            }

            if(result.affectedRows==0)
                res.status(404).send("Student NOT found to delete");
            else
                res.send("Student Deleted");

        });

});

// Create the Phone and Age columns when the server starts.
ensureStudentColumn("phone", "VARCHAR(20)", (err) => {
    if (err) {
        console.error("Could not add student phone column:", err.message);
        return;
    }
    ensureStudentColumn("age", "INT", (ageErr) => {
        if (ageErr) {
            console.error("Could not add student age column:", ageErr.message);
            return;
        }
        //Server to listen on port number 3000
        app.listen(3000, () => {
            console.log("Server running at http://localhost:3000");
        });
    });
});