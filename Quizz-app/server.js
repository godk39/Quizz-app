const express = require("express");
const mongodb = require("mongodb");
const app = express();
const ObjectId = require('mongodb').ObjectId;


app.use(express.static("public"));
// decode req.body from form-data
app.use(express.urlencoded({extended: true}));
// decode req.body from post body message
app.use(express.json());
let defaultState = false;
let current = new Date();
app.post("/attempts", attemptQuiz);

app.post("/attempts/:id/submit", submitQuiz);

//attempt quiz
async function attemptQuiz(req, res) {
    //get 10 random questions from database
    const docs = await db.collection("questions").aggregate([{$sample: {size: 10}}]).toArray();
    //create an attempt and add it into database
    const attempt = {};
    attempt.questions = docs; 
    attempt.startedAt = current.toLocaleTimeString();
    attempt.completed = defaultState;
    //insert attempt into database
    const result = await db.collection("attempts").insertOne(attempt);
    //delete correct answer field before sending data to client
    for (const doc of docs) {
        delete doc["correctAnswer"];
    }
    console.log(result);
    res.status(201).json(attempt);
}

//submit quiz
async function submitQuiz(req, res) {
    const id = req.params.id;
    const o_id = new ObjectId(id);
    const userAns = req.body.answers;
    //check if the attempt exist
    const attempt = await db.collection("attempts").findOne( { _id: o_id } );
    console.log(userAns);
    if (attempt === null) {
        //NOT FOUND
        return res.status(404).end();
    }

   //check for cheating
    
    if (attempt.completed == true) {
        res.status(201).json(attempt);
    } else
    if (attempt.completed == false) {

        //create correct answers for comparison
        let correctAnswers = {};

        for (quest of attempt.questions) {
            const key = quest._id;
            const value = quest.correctAnswer;
            correctAnswers[key] = value;
        }
        // scoring the attempt: 
       
        let score = 0;
        for (index in userAns) {
            if (correctAnswers[index] == userAns[index]) {
                score++;
            }
        }

        //determine the scoreText bases on score
        let scoreText = null;
        if (score < 5) {
            scoreText = "Practice more to improve it :D";
        } else if (score >= 5 || score < 7) {
            scoreText = "Good, keep it up";
        } else if (score >= 7 || score < 9) {
            scoreText = "Well done!";
        } else {
            scoreText = "Perfect!!"
        }
        //update the attempt in server then replace it in database
        attempt.correctAnswers = correctAnswers;
        attempt.scoreText = scoreText;
        attempt.answers =  userAns;
        attempt.score = score;
        attempt.completed = true;
        const result = await db.collection("attempts").findOneAndReplace({ _id: o_id }, attempt, { upsert: false });
        res.status(200).json(attempt);
    }
}

//connet db
let db = null;
async function startServer() {
    const client = await mongodb.MongoClient.connect("mongodb://localhost:27017/wpr-quiz");
    db = client.db();
    console.log("connected to db");
    //start listening
    app.listen(3000, function () {
        console.log('Listening on port 3000!');
    });
}

startServer();