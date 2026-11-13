
const lessons = {
  motion: {
    title: "Motion",
    subtitle: "Understanding how objects move.",
    explanation:
      "An object is said to be in motion when its position changes with time relative to a reference point. Motion can be described using distance, displacement, speed, velocity and acceleration.",
    example:
      "When a car travels along a road, its position changes with time. Therefore, the car is in motion relative to the road.",
    formula: "Speed = Distance / Time",
    calculation:
      "Example: If a student covers 100 metres in 20 seconds, speed = 100 / 20 = 5 m/s.",
    remember:
      "Distance is the total path travelled, while displacement is the shortest straight-line change in position.",
    question: "A car travels 120 metres in 10 seconds. What is its speed?",
    options: ["10 m/s", "12 m/s", "15 m/s", "20 m/s"],
    answer: 1,
    explanationAnswer:
      "Speed = Distance / Time = 120 / 10 = 12 m/s."
  },

  force: {
    title: "Force and Laws of Motion",
    subtitle: "Understanding why objects move or change their motion.",
    explanation:
      "Force is a push or pull acting on an object. It can change an object's speed, direction or shape. Newton's laws explain the relationship between force and motion.",
    example:
      "When you kick a stationary football, the applied force changes its state of rest and makes it move.",
    formula: "Force = Mass × Acceleration (F = ma)",
    calculation:
      "Example: A 2 kg object accelerates at 3 m/s². Force = 2 × 3 = 6 N.",
    remember:
      "Newton's first law is also called the law of inertia. An object resists changes in its state of motion.",
    question: "What is the SI unit of force?",
    options: ["Joule", "Watt", "Newton", "Pascal"],
    answer: 2,
    explanationAnswer:
      "The SI unit of force is the newton (N)."
  },

  gravitation: {
    title: "Gravitation",
    subtitle: "Understanding the attractive force between objects.",
    explanation:
      "Gravitation is the force of attraction between any two objects having mass. Earth's gravitational force pulls objects towards its centre.",
    example:
      "When you release a ball from your hand, it falls towards the ground because of Earth's gravitational attraction.",
    formula: "Weight = Mass × Acceleration due to gravity (W = mg)",
    calculation:
      "Example: For a 5 kg object on Earth, using g = 9.8 m/s², weight = 5 × 9.8 = 49 N.",
    remember:
      "Mass is the amount of matter in an object. Weight is the gravitational force acting on it.",
    question: "What causes an object to fall towards Earth?",
    options: ["Magnetism", "Gravity", "Friction", "Sound"],
    answer: 1,
    explanationAnswer:
      "Earth's gravitational force attracts objects towards its centre."
  },

  work: {
    title: "Work and Energy",
    subtitle: "Understanding work, energy and power.",
    explanation:
      "In physics, work is done when a force produces displacement in an object in the direction of the force. Energy is the capacity to do work.",
    example:
      "When you push a box and it moves forward, you do work on the box.",
    formula: "Work = Force × Displacement (W = Fs)",
    calculation:
      "Example: A force of 10 N moves a box by 2 m in its direction. Work = 10 × 2 = 20 J.",
    remember:
      "The SI unit of work and energy is the joule (J).",
    question: "What is the SI unit of energy?",
    options: ["Newton", "Metre", "Joule", "Second"],
    answer: 2,
    explanationAnswer:
      "The SI unit of energy is the joule (J)."
  },

  sound: {
    title: "Sound",
    subtitle: "Understanding how sound travels.",
    explanation:
      "Sound is produced by vibrating objects. It travels through a material medium as a mechanical wave and cannot travel through a vacuum.",
    example:
      "When you strike a bell, it vibrates and produces sound that travels through the surrounding air.",
    formula: "Wave Speed = Frequency × Wavelength (v = fλ)",
    calculation:
      "Example: If frequency is 100 Hz and wavelength is 2 m, wave speed = 100 × 2 = 200 m/s.",
    remember:
      "Frequency is the number of vibrations per second. Its SI unit is hertz (Hz).",
    question: "Can sound travel through a vacuum?",
    options: ["Yes, always", "No", "Only at night", "Only at high temperature"],
    answer: 1,
    explanationAnswer:
      "Sound needs a material medium to travel, so it cannot travel through a vacuum."
  }
};

const topicGrid = document.getElementById("topicGrid");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchMessage = document.getElementById("searchMessage");

let currentTopic = "motion";
let answered = false;

function loadLesson(topic) {
  const lesson = lessons[topic];

  if (!lesson) return;

  currentTopic = topic;
  answered = false;

  document.getElementById("lessonTitle").textContent = lesson.title;
  document.getElementById("lessonSubtitle").textContent = lesson.subtitle;
  document.getElementById("lessonExplanation").textContent = lesson.explanation;
  document.getElementById("lessonExample").textContent = lesson.example;
  document.getElementById("lessonFormula").textContent = lesson.formula;
  document.getElementById("lessonCalculation").textContent = lesson.calculation;
  document.getElementById("lessonRemember").textContent = lesson.remember;
  document.getElementById("quizQuestion").textContent = lesson.question;

  document.getElementById("quizFeedback").textContent = "";
  document.getElementById("nextQuestion").hidden = true;

  const optionsContainer = document.getElementById("quizOptions");
  optionsContainer.innerHTML = "";

  lesson.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener("click", () => checkAnswer(index));
    optionsContainer.appendChild(button);
  });

  document.getElementById("motionGraph").hidden = topic !== "motion";

  if (topic === "motion") {
    drawGraph();
  }

  document.getElementById("lesson").scrollIntoView({
    behavior: "smooth"
  });
}

function checkAnswer(selectedIndex) {
  if (answered) return;

  answered = true;
  const lesson = lessons[currentTopic];
  const buttons = document.querySelectorAll(".quiz-option");
  const feedback = document.getElementById("quizFeedback");

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === lesson.answer) {
      button.classList.add("correct");
    } else if (index === selectedIndex) {
      button.classList.add("wrong");
    }
  });

  if (selectedIndex === lesson.answer) {
    feedback.textContent = "Correct! " + lesson.explanationAnswer;
    feedback.style.color = "#16834a";
  } else {
    feedback.textContent = "Not quite. " + lesson.explanationAnswer;
    feedback.style.color = "#b42318";
  }

  document.getElementById("nextQuestion").hidden = false;
}

function searchTopic() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    searchMessage.textContent = "Please enter a topic name.";
    return;
  }

  const topic = Object.keys(lessons).find(key => {
    return key.includes(query) ||
      lessons[key].title.toLowerCase().includes(query);
  });

  if (topic) {
    searchMessage.textContent = "";
    loadLesson(topic);
    return;
  }

  searchMessage.textContent =
    "Topic not found. Try Motion, Force, Gravitation, Work or Sound.";
}

function drawGraph() {
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const left = 65;
  const bottom = height - 45;
  const top = 25;
  const right = width - 25;

  // Grid
  ctx.strokeStyle = "#e1e8f2";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const x = left + (right - left) * i / 5;
    const y = bottom - (bottom - top) * i / 5;

    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = "#17233d";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = "#17233d";
  ctx.font = "14px Arial";
  ctx.fillText("Distance (m)", 8, 18);
  ctx.fillText("Time (s)", right - 45, height - 10);

  // Graph line: 2 metres per second
  ctx.strokeStyle = "#1763df";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, top + 10);
  ctx.stroke();

  // Data points
  ctx.fillStyle = "#ff9d22";

  for (let i = 0; i <= 5; i++) {
    const x = left + (right - left) * i / 5;
    const y = bottom - (bottom - top - 10) * i / 5;

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Topic card buttons
document.querySelectorAll(".learn-btn").forEach(button => {
  button.addEventListener("click", () => {
    loadLesson(button.dataset.topic);
  });
});

searchButton.addEventListener("click", searchTopic);

searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    searchTopic();
  }
});

document.getElementById("nextQuestion").addEventListener("click", () => {
  loadLesson(currentTopic);
});

// Load Motion when the website first opens
loadLesson("motion");
