let currentQuestionIndex = 0; // Keep track of the current question
let userAnswers = []; // Store the user's answers for each question
let timerInterval; // Declare timerInterval
let timeForQuestion = 30; // in seconds for each question
let startTime; // Declare startTime

let totalTime = 300; // Total time for the quiz in seconds (e.g., 300 seconds = 5 minutes)
let quizTimerInterval; // Declare quizTimerInterval

/**
 * -----------------------------------------------------------------------------
 * Add a function to start the quiz timer
 * -----------------------------------------------------------------------------
 */
function startQuizTimer() {
  let timeRemaining = totalTime;
  quizTimerInterval = setInterval(() => {
    if (timeRemaining <= 0) {
      clearInterval(quizTimerInterval);
      finishQuiz(); // Automatically finish the quiz
    } else {
      timeRemaining--;
      updateTimerDisplay(timeRemaining);
    }
  }, 1000);
}

/**
 * -----------------------------------------------------------------------------
 * Add a function to update the timer display
 * -----------------------------------------------------------------------------
 */
function updateTimerDisplay(timeRemaining) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  document.getElementById('quiz-timer').textContent = `${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;
}


/**
 * -----------------------------------------------------------------------------
 * Add a function to reset the timer
 * -----------------------------------------------------------------------------
 */
function resetTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/** 
 * -----------------------------------------------------------------------------
 * Add a function to start the timer
 * -----------------------------------------------------------------------------
*/
function startTimer(duration, display) {
  let timer = duration;
  display.textContent = formatTime(timer);

  resetTimer(); // Clear any existing timer

  timerInterval = setInterval(function () {
    timer--;
    display.textContent = formatTime(timer);

    if (timer <= 0) {
      clearInterval(timerInterval);
      if (currentQuestionIndex < questions.length - 1) {
        goToNextQuestion();
      } else {
        finishQuiz();
      }
    }
  }, 1000);
}

/** 
 * -----------------------------------------------------------------------------
 * Add a function to format the time
 * -----------------------------------------------------------------------------
*/
function formatTime(time) {
  let minutes = parseInt(time / 60, 10);
  let seconds = parseInt(time % 60, 10);

  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return minutes + ':' + seconds;
}

/**
 * -----------------------------------------------------------------------------
 * Add a function to finish the quiz
 * -----------------------------------------------------------------------------
 */
function finishQuiz() {
  clearInterval(quizTimerInterval);

  const endTime = new Date();
  const timeTaken = new Date(endTime - startTime);
  const minutes = timeTaken.getUTCMinutes();
  const seconds = timeTaken.getUTCSeconds();

  const correctAnswersCount = questions.filter(
    (q, index) => userAnswers[index] === q.answer
  ).length;
  const incorrectAnswersCount = questions.length - correctAnswersCount;

  resetTimer();
  const finalScore = calculateScore();
  const scorePercentage = (finalScore / questions.length) * 100;

  let resultsHTML = `
    <h1>Simple Quiz App Results</h1>
    <p>
      Final Score: ${finalScore}/${questions.length} 
      (${scorePercentage.toFixed(2)}%)
    </p>
    <div class="review-container">
    <h3 class="review-title">Performance Review</h3>
  `;

  // Generate personalized feedback
  let feedback = '';

  if (scorePercentage >= 80) {
    feedback = 'Excellent work! Keep it up!';
  } else if (scorePercentage >= 50) {
    feedback = 'Good effort! Review the incorrect answers to improve further.';
  } else {
    feedback =
      'Looks like you might need some more practice. \nTry reviewing the material and retaking the quiz.';
  }

  resultsHTML += `<p class="feedback">${feedback}</p>`;

  // Compile results for each question
  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.answer;
    const correctClass = isCorrect ? 'correct-answer' : 'incorrect-answer';

    resultsHTML += `
      <div class='question-review ${correctClass}'>
        <p>Question ${index + 1}: ${question.question}</p>
        <p>Your answer: ${userAnswer || 'No answer'}</p>
        <p>${isCorrect ? 'Correct' : 'Incorrect'}</p>
      </div>
    `;
  });

  resultsHTML += `<button id='retry-quiz' onclick='location.reload();'>
                    Retry Quiz
                  </button>`;

  resultsHTML += `<button id="download-pdf" onclick="generatePDF()">
                    Download PDF Report
                  </button>`;

  // Display results
  document.getElementById('quiz-container').innerHTML = resultsHTML;

  // Data for Chart.js
  const correctAnswers = questions.filter(
    (q, index) => userAnswers[index] === q.answer
  ).length;
  const incorrectAnswers = questions.length - correctAnswers;

  // Create a canvas element for the chart
  resultsHTML += `<canvas id="resultsChart" width="400" height="400"></canvas></div>`;

  document.getElementById('quiz-container').innerHTML = resultsHTML;

  // Generate the chart
  const ctx = document.getElementById('resultsChart').getContext('2d');
  const resultsChart = new Chart(ctx, {
    type: 'pie', // or 'bar'
    data: {
      labels: ['Correct Answers', 'Incorrect Answers'],
      datasets: [
        {
          label: 'Quiz Results',
          data: [correctAnswersCount, incorrectAnswersCount],
          backgroundColor: [
            'rgba(0, 128, 0, 0.7)', // Green for correct
            'rgba(255, 0, 0, 0.7)', // Red for incorrect
          ],
        },
      ],
    },
  });
}

/**
 * -----------------------------------------------------------------------------
 * Add a function to go to the next question
 * -----------------------------------------------------------------------------
 */
function goToNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion(currentQuestionIndex);
  } else {
    finishQuiz();
  }
}

/** 
 * -----------------------------------------------------------------------------
 * Add a function to handle option selection
 * -----------------------------------------------------------------------------
*/
function handleOptionSelect(selectedOption, button) {
  // Create tooltip
  let tooltip = document.createElement('span');
  tooltip.classList.add('tooltip');
  tooltip.textContent = 'Selected';

  // Store user's answer
  userAnswers[currentQuestionIndex] = selectedOption;

  // Remove 'selected-answer' class from all options
  const options = document.querySelectorAll('#options button');
  options.forEach((opt) => opt.classList.remove('selected-answer'));

  // Add tooltip to clicked button
  button.appendChild(tooltip);

  // Add 'selected-answer' class to clicked button
  button.classList.add('selected-answer');

  // Show tooltip
  setTimeout(() => {
    tooltip.classList.add('show-tooltip');
  }, 100);

  // Remove tooltip after some time
  setTimeout(() => {
    tooltip.remove();
  }, 1000); // Adjust the time as needed

  // Check if this is the last question
  if (currentQuestionIndex === questions.length - 1) {
    finishQuiz(); // Immediately show results for the last question
  } else {
    // Enable the Next Question button for other questions
    document.getElementById('next-question').disabled = false;
  }

  // Provide visual feedback for selection (optional)
  // For example, change the color of the selected button
}

/** 
 * -----------------------------------------------------------------------------
 * Add a function to calculate the score
 * -----------------------------------------------------------------------------
*/
function calculateScore() {
    let score = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === questions[index].answer) {
            score++;
        }
    });
    return score;
}

/**
 * -----------------------------------------------------------------------------
 * Add a function to load the question
 * -----------------------------------------------------------------------------
 * @param {number} questionIndex 
 */
function loadQuestion(questionIndex) {
  if (questionIndex === 0) {
    // startTime = new Date(); // Start timer on the first question
    // startQuizTimer();
  }

  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const progressEl = document.getElementById('progress');

  // Update progress
  progressEl.innerText = `Question ${questionIndex + 1} of ${questions.length}`;

  // Set the question text
  questionEl.innerText = questions[questionIndex].question;

  // Clear previous options
  optionsEl.innerHTML = '';

  // Load the options and add event listeners
  questions[questionIndex].options.forEach((option) => {
    const button = document.createElement('button');
    button.innerText = option;
    button.classList.add('btn', 'btn-primary', 'btn-lg', 'my-2'); // Bootstrap classes

    button.addEventListener('click', () => handleOptionSelect(option, button));
    optionsEl.appendChild(button);
  });

  // Disable the Next Question button until an option is selected
  document.getElementById('next-question').disabled = true;

  // Start or reset the timer
  if (questionIndex < questions.length - 1) {
    // startTimer(timeForQuestion, document.getElementById('timer'));
  }
}

/** 
 * -----------------------------------------------------------------------------
 * Add a function to generate the PDF
 * -----------------------------------------------------------------------------
*/
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let yPos = 20; // Starting position for quiz review

  /**
   * Add quiz information
   * --------------------
   */
  const quizTitle = 'Simple Quiz App Report'; // Replace with your quiz title
  const quizDate = new Date().toLocaleString(); // Current date and time

  doc.setFontSize(24); // Increase font size for title
  doc.setFont('helvetica', 'bold');
  doc.text(quizTitle, 20, yPos);
  doc.setFont('helvetica', 'normal');

  /**
   * Add final score and date
   * ------------------------
   */
  const finalScore = calculateScore();
  const scorePercentage = (finalScore / questions.length) * 100;
  const scoreSummary = `Final Score: ${finalScore}/${
    questions.length
  } (${scorePercentage.toFixed(2)}%)`;

  doc.setFontSize(11); // Decrease font size for final score and date
  doc.text(scoreSummary, 20, (yPos += 7)); // Add score summary
  doc.text(`Date: ${quizDate}`, 75, yPos); // Add date on the same line as score summary
  doc.setFontSize(12); // Reset font size to default
  doc.line(20, 31, 190, 31); // Add horizontal line
  doc.text('', 20, (yPos += 10)); // Add empty space after horizontal line

  /**
   * Add detailed question review
   * ----------------------------
   */
  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index] || 'No answer';
    const correctAnswer = question.answer;
    const isCorrect = userAnswer === correctAnswer;
    const questionNumber = `Q${index + 1}:`;
    const questionText = `${question.question}`;
    const answerText = `Your Answer: ${userAnswer} (${
      isCorrect ? 'Correct' : 'Incorrect'
    })`;
    doc.setFont('helvetica', 'bold');
    doc.text(questionNumber, 20, (yPos += 7));
    doc.setFont('helvetica', 'normal');
    doc.text(`${questionText}`, 30, yPos);

    doc.setTextColor(100, 102, 104);
    doc.text(answerText, 30, (yPos += 5));
    doc.setTextColor(0, 0, 0);
    yPos += 3; // Adjust for next question
    if (yPos > 270) {
      // Ensure there's space for the next question or add a new page
      doc.addPage();
      yPos = 20;
    }
  });

  /**
   * Add graphical representation of results
   * ---------------------------------------
   */
  const correctAnswers = calculateScore();
  const incorrectAnswers = questions.length - correctAnswers;
  yPos += 10; // Adjusted yPos after adding questions
  doc.setFontSize(10); // Decrease font size for visualization
  doc.text('Visualization', 23, yPos + 20, { angle: 90 }); // Add vertical text
  doc.rect(25, yPos, correctAnswers * 3, 20, 'F'); // Bar for correct answers
  doc.rect(25 + correctAnswers * 3, yPos, incorrectAnswers * 3, 20); // Bar for incorrect answers
  doc.setFontSize(8);
  doc.text(`Correct [ filled ]: ${correctAnswers}`, 25, (yPos += 24));
  doc.text(`Incorrect [ no fill ]: ${incorrectAnswers}`, 55, (yPos));
  doc.setFontSize(10);

  /**
   * Generate personalized feedback
   * ------------------------------
   */
  let feedback = '';
  if (scorePercentage >= 80) {
    feedback = 'Excellent work! Keep it up!';
  } else if (scorePercentage >= 50) {
    feedback = 'Good effort! Review the incorrect answers to improve further.';
  } else {
    feedback =
      'It looks like you might need some more practice. Try reviewing the material and retaking the quiz.';
  }
  doc.text(feedback, 25, (yPos += 5)); // Add feedback
  doc.line(20, 270, 190, 270); // Add horizontal line

  /**
   * Save the PDF with the name "Quiz Report.pdf"
   * --------------------------------------------
   */
  doc.save('Quiz Report.pdf');
}

/** 
 * -----------------------------------------------------------------------------
 * Add event listener for the Next Question button
 * -----------------------------------------------------------------------------
*/
document.getElementById('next-question').addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion(currentQuestionIndex);
  } else {
    // Handle end of quiz, such as displaying results
  }
});

document
  .getElementById('quiz-start-btn')
  .addEventListener('click', function () {
    startQuizTimer(); // Start the timer when the quiz starts
    document.getElementById('quiz-content').style.display = 'block'; // Show the quiz
    document.getElementById('quiz-start-text').style.display = 'none'; // Hide the start text
    loadQuestion(0); // Load the first question
    this.style.display = 'none'; // Hide the start button
  });



/** 
 * -----------------------------------------------------------------------------
 * Load the first question
 * -----------------------------------------------------------------------------
*/
loadQuestion(0);
