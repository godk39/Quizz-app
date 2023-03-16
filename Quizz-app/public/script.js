//fetch API and call method to display data
async function getForm() {
  let startView = document.querySelector("#introduction");
  if (startView.style.display === "none") {
    startView.style.display = "block";
  } else {
    startView.style.display = "none";
  }
  const res = await fetch("/attempts",
    { method: "POST" });
  let data = await res.json();
  const questionId = [];
  const questionSubmitted = [];
  const answerData = [];
  const answerInput = [];
  // for (let i = 0; i < data.questions.length; i++) {
  //   questionId.push(data.questions[i]._id);
  // }

  showAttemptQuiz(data.questions);

  //add highlight event to labels 
  document.querySelectorAll(".answer-label").forEach(ans => {
    ans.addEventListener("click", onClick);
  })

  document.querySelectorAll(".input-answer").forEach(ansIn => {
    if (ansIn.value == 0) {
      answerInput.push(ansIn.parentNode.parentNode.parentNode);
    }
  });

  const submitBtn = document.querySelector(".green-buttons");
  submitBtn.addEventListener("click", function onSubmit() {
    for (let i = 0; i < answerInput.length; i++) {
      for (let j = 0; j < answerInput[i].children.length; j++) {
        if (answerInput[i].children[j].children[0].children[0].checked === true) {
          answerData.push(answerInput[i].children[j].children[0].children[0].value);
          questionId.push(answerInput[i].id);
          questionSubmitted.push(answerInput[i]);
        }
      }
    }

    alert("Are you sure you want to submit?");

    //hide attempt view then show review view
    let x = document.getElementById("attempt-quiz");
    let y = document.getElementById("review-quiz");
    if (x.style.display === "none") {
      x.style.display = "block";
      y.style.display = "none";
    } else {
      x.style.display = "none";
      y.style.display = "block";
      document.getElementById("introduction").style.display = "none";

    }
    //create the object to pass in as json body
    let obj = { answers: {} };
    for (let i = 0; i < answerData.length; i++) {
      obj.answers[questionId[i]] = answerData[i];
    }


    fetch("/attempts/" + data._id + "/submit", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    }).then(res => {
      return res.json();
    }).then(reviewData => showReviewQuiz(reviewData, questionSubmitted))
  });

}



const againBtn = document.createElement("button");

//create the review view
const showReviewQuiz = (reviewData, questionSubmitted) => {
  const reviewContainer = document.querySelector("#review-quiz");
  const formView = document.createElement("form");
  formView.className = "review-quiz-questions";
  const answerInput = document.querySelectorAll(".input-answer");
  const resultView = document.createElement("div");
  let correctAns = reviewData.correctAnswers;
  let checkedIndex = [];


  answerInput.forEach(ans => {
    if (ans.checked === true) {
      ans.classList.add("checked");
    }

  })
  for (let i = 0; i < answerInput.length; i++) {
    if (answerInput[i].classList.contains("checked")) {
      checkedIndex.push(i);
    }
  }


  reviewData.questions.forEach((question, index) => {
    let h = 0;
    index = index + 1;
    const reviewQuestionView = document.createElement("div");
    reviewQuestionView.innerHTML = `
  <div class = "question">
          <h3 class = "question-index-r">Question ${index} of 10</h3>
          <P class = "question-title-r"></p>
          <div class = "answers-wrap${index}-r answers-r" >
          </div>
        </div>`;

    reviewQuestionView.querySelector(".question-title-r").innerHTML = question.text;

    let reviewOptionsContainer = reviewQuestionView.querySelector(".answers-r");


    question.answers.forEach((answer, k) => {
      k = k + 1;
      const optionView = document.createElement("div");
      optionView.innerHTML = `<label for="q${index}-${k}-r" class="answer-label-r">
          <input class="input-answer-r"type="radio" id="q${index}-${k}-r" name="q${index}-r" value="${h}">
          <span class="answer-r"></span>
          
          </label>
        `;
      optionView.querySelector(".answer-r").innerText = answer;
      reviewOptionsContainer.appendChild(optionView);
      h = h + 1;
    })
    // questionId.push(question._id);
    resultView.className = "result-view";
    resultView.innerHTML = ` <h2 id="result">Result</h2>
    
       <p id="score">${reviewData.score}/10</p>
  
       <p id="percentage">${((reviewData.score) / 10) * 100}%</p>
  
       <p id="comment">${reviewData.scoreText}</p>`;

    againBtn.type = "button";
    againBtn.className = "blue-buttons try-again";
    againBtn.id = "again-button";
    againBtn.textContent = "Try again";
    resultView.appendChild(againBtn);
    formView.appendChild(reviewQuestionView);


    //   <button type="button" class="blue-buttons try-again" id="again-button"> Try again </button>

  });
  reviewContainer.appendChild(formView);
  reviewContainer.appendChild(resultView);

  let form = document.querySelector(".review-quiz-questions");
  form.scrollIntoView(true);


  const answerReview = document.querySelectorAll(".input-answer-r");
  for (let i = 0; i < answerReview.length; i++) {
    answerReview[i].disabled = true;
    for (let j = 0; j < checkedIndex.length; j++) {
      if (i === checkedIndex[j]) {
        answerReview[i].checked = true;
        answerReview[i].classList.add("checked-r");
      }
    }
  }

  const checkedValue = document.querySelectorAll(".checked-r");
  let obj = {};
  for (let i = 0; i < questionSubmitted.length; i++) {
    obj[questionSubmitted[i].id] = checkedValue[i];
  }
  
  const allQuestions = {};
  let allQ = document.querySelectorAll(".answers-r");
  for (let i = 0; i < allQ.length; i++) {
    allQuestions[reviewData.questions[i]._id] = allQ[i];
  }

  //Colorize the answers
  for (let i in correctAns) {
    const correctSpan = document.createElement("span");
    const wrongSpan = document.createElement("span");
    correctSpan.className = "correct-ans";
    correctSpan.innerHTML = "Correct Answer";
    wrongSpan.className = "your-ans";
    wrongSpan.innerHTML = "Your Answer";
    for (let j in obj) {
      if (i == j) {
        if (correctAns[i] == obj[j].value) {
          obj[j].parentNode.style.backgroundColor = "#d4edda";
          obj[j].parentNode.appendChild(correctSpan);
        } else {
          obj[j].parentNode.style.backgroundColor = "#f8d7da";
          obj[j].parentNode.appendChild(wrongSpan);
        }
      }
    }
    //Give correct answer grey color if not checked
    for (let j in allQuestions) {
      for (let k = 0; k < allQuestions[j].children.length; k++) {
        if (i == j) {
          if (correctAns[i] == k) {
            if (allQuestions[j].children[k].children[0].children[0].checked === false) {
              allQuestions[j].children[k].children[0].style.backgroundColor = "#ddd";
              allQuestions[j].children[k].children[0].appendChild(correctSpan);
            }
          }
        }
      }
    }
  }


}

//create the attempt quiz view
const showAttemptQuiz = (questions) => {

  const questionContainer = document.querySelector("#attempt-quiz");
  const formView = document.createElement("form");
  formView.className = "attempt-quiz-questions";
  formView.method = "POST";

  questions.forEach((question, index) => {
    let h = 0;
    index = index + 1;
    const questionView = document.createElement("div");
    questionView.innerHTML = `
      <div class = "question" >
              <h3 class = "question-index">Question ${index} of 10</h3>
              <P class = "question-title"></p>
              <div class = "answers-wrap${index} answers" id = "${question._id}">
              </div>
            </div>`;

    questionView.querySelector(".question-title").innerHTML = question.text;

    let optionsContainer = questionView.querySelector(".answers");


    question.answers.forEach((answer, k) => {
      k = k + 1;
      const optionView = document.createElement("div");
      optionView.innerHTML = `<label for="q${index}-${k}" class="answer-label">
              <input class="input-answer"type="radio" id="q${index}-${k}" name="q${index}" value="${h}">
              <span class="answer"></span></label>
            `
      optionView.querySelector(".answer").innerText = answer;
      optionsContainer.appendChild(optionView);
      h = h + 1;
    })

    formView.appendChild(questionView);
  });
  const submitView = document.createElement("div");
  submitView.className = "submit-box";
  const submitBtn = document.createElement("button");
  submitBtn.className = "green-buttons";
  submitBtn.type = "button";
  submitBtn.id = "submit-button";
  submitBtn.textContent = "Submit your answers ❯";
  //greenBtn.addEventListener("click", confirmSubmit(data));
  submitView.appendChild(submitBtn);
  formView.appendChild(submitView);
  questionContainer.appendChild(formView);
  let form = document.querySelector(".attempt-quiz-questions");
  form.scrollIntoView(true);

}

//function to highlight clicks
function onClick(event) {
  const ele = event.currentTarget;
  const grandFatherEle = ele.parentNode.parentNode;
  const selectedEle = grandFatherEle.querySelector(".selected");
  if (selectedEle) {
    selectedEle.classList.remove("selected");
  }
  ele.classList.add("selected");
}





//start quiz
const btnStart = document.querySelector("#start-button");

btnStart.addEventListener("click", getForm);
//try again function
againBtn.addEventListener("click", function onAgain() {
  document.getElementById("attempt-quiz").innerHTML = "";
  document.getElementById("review-quiz").innerHTML = "";
  document.getElementById("introduction").style.display = "block";
  document.getElementById("attempt-quiz").style.display = "block";
});










