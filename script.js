const params = new URLSearchParams(location.search);
const type = params.get("type") || "all";
const QUESTION_LIMIT = 50;

const quizInfo = {
  generativeAi: { title: "Generative AI Test", desc: "生成AIの基礎・プロンプト・リスク・活用・法務倫理" },
  gKentei: { title: "G検定", desc: "AI基礎・機械学習・ディープラーニング・社会実装・法律倫理" },
  eShikaku: { title: "E資格", desc: "深層学習・数学・最適化・CNN/RNN/Transformer・実装" },
  pythonBasic: { title: "Python 3 エンジニア認定基礎試験", desc: "Python文法・型・制御構文・関数・モジュール・例外" },
  pythonData: { title: "Python 3 エンジニア認定データ分析試験", desc: "NumPy・pandas・Matplotlib・scikit-learn・統計基礎" }
};

const pageTitle = document.getElementById("pageTitle");
const pageDesc = document.getElementById("pageDesc");
const quizList = document.getElementById("quizList");

if (type === "all") {
  document.title = "AI・Python資格クイズ";
  pageTitle.textContent = "AI・Python資格クイズ";
  pageDesc.textContent = "5カテゴリ・各150問から50問ランダムで出題";
} else {
  const info = quizInfo[type] || quizInfo.generativeAi;
  document.title = info.title;
  pageTitle.textContent = info.title;
  pageDesc.textContent = info.desc;
}

quizList.innerHTML = `
  <a href="index.html" class="${type === "all" ? "active" : ""}">全カテゴリ50問</a>
  ${Object.keys(quizInfo).map(key => `
    <a href="?type=${key}" class="${type === key ? "active" : ""}">${quizInfo[key].title}</a>
  `).join("")}
`;

function normalizeQuestion(q){
  return { question: q.question || q.q, choices: q.choices || q.c, answer: q.answer || q.a, explanation: q.explanation || q.e || "" };
}
function shuffle(array){
  return array.map(v => [Math.random(), v]).sort((a,b) => a[0] - b[0]).map(v => v[1]);
}
let questions = [];
if (type === "all") {
  Object.keys(quizInfo).forEach(key => {
    if (window.quizData && Array.isArray(window.quizData[key])) questions.push(...window.quizData[key].map(normalizeQuestion));
  });
} else {
  questions = window.quizData?.[type] ? window.quizData[type].map(normalizeQuestion) : [];
}
questions = shuffle(questions).slice(0, QUESTION_LIMIT);

let currentIndex = 0;
let score = 0;
let answered = false;
const counter = document.getElementById("counter");
const scoreEl = document.getElementById("score");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const resultEl = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");

function showQuestion() {
  answered = false;
  resultEl.textContent = "";
  nextBtn.style.display = "none";
  if (questions.length === 0) {
    questionEl.textContent = "問題データが読み込めませんでした";
    choicesEl.innerHTML = "";
    counter.textContent = "0 / 0";
    scoreEl.textContent = "スコア: 0";
    progressBar.style.width = "0%";
    return;
  }
  if (currentIndex >= questions.length) {
    questionEl.textContent = "終了！";
    choicesEl.innerHTML = "";
    counter.textContent = `${questions.length} / ${questions.length}`;
    scoreEl.textContent = `スコア: ${score}`;
    resultEl.textContent = `${questions.length}問中 ${score}問正解`;
    progressBar.style.width = "100%";
    return;
  }
  const q = questions[currentIndex];
  counter.textContent = `${currentIndex + 1} / ${questions.length}`;
  scoreEl.textContent = `スコア: ${score}`;
  questionEl.textContent = q.question;
  progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  choicesEl.innerHTML = "";
  q.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.onclick = () => {
      if (answered) return;
      answered = true;
      if (choice === q.answer) { score++; resultEl.textContent = "正解！"; btn.classList.add("correct"); }
      else { resultEl.textContent = `不正解。正解は「${q.answer}」`; btn.classList.add("wrong"); }
      [...choicesEl.children].forEach(b => { b.disabled = true; if (b.textContent === q.answer) b.classList.add("correct"); });
      if (q.explanation) resultEl.textContent += ` ${q.explanation}`;
      scoreEl.textContent = `スコア: ${score}`;
      nextBtn.style.display = "block";
    };
    choicesEl.appendChild(btn);
  });
}
nextBtn.onclick = () => { currentIndex++; showQuestion(); };
showQuestion();
