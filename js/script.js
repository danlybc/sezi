// Variables declaration
const activeWordsArray = [];
const input = document.querySelector("input");
let activeWordsSelector = document.getElementsByClassName("word");
const rightWordsArray = [],
  wrongWordsArray = [];
let timer = 0,
  wordSelector = 0,
  redoState,
  wpmVal,
  preVal,
  numberChar,
  activeWord;
let maxTimer = 60; // 60 by default
const maxWordsInBatch = 20;

// Local variables for theme and timer
const saveTheme = theme => localStorage.setItem("theme", theme);
const saveTime = time => localStorage.setItem("time", time);
const saveLang = lang => localStorage.setItem("language", lang);

// Themes
let theme = localStorage.getItem("theme"); // see if there is a savec theme
const themes = ["france", "blackyellow", "ayu", "dracula"];
function setThemes(choosenTheme) {
  theme = choosenTheme - 1;
  const body = document.getElementsByTagName("body")[0];
  body.className = themes[theme];
  saveTheme(choosenTheme);
}

function generateThemeThumbnails() {
  for (let i = 0; i < themes.length; i++) {
    const div = document.createElement("div");
    div.className = "theme";
    div.classList.add(themes[i]);
    div.onclick = `setThemes(${i})`;
    div.setAttribute("onclick", `setThemes(${i + 1})`);
    div.innerHTML = ` <div class="line"></div>
        <div class="line"></div>
        <div class="minitimer"></div>`;
    document.getElementById("themes-preview").appendChild(div);
  }
}

// Timer
function setTimer() {
  $("#time-selector ul li").click(function() {
    maxTimer = parseInt($(this).text(), 10);
    saveTime(maxTimer);
    document.getElementsByClassName("active")[0].className = "";
    $(this).addClass("active");
    console.log($(this));
    console.log(maxTimer);
  });
}

function setSavedTimer() {
  maxTimer = localStorage.getItem("time");
  document.getElementsByClassName("active")[0].className = "";
  let timeSelector = document
    .getElementById("time-selector")
    .getElementsByTagName("li");
  for (let i = 0; i < timeSelector.length; i++) {
    if (timeSelector[i].innerHTML == maxTimer) {
      timeSelector[i].className = "active";
    }
  }
}

if (localStorage.getItem("language")) {
  let language = localStorage.getItem("language");
} else {
  let language = "en";
}

const getRandomElement = array =>
  array[Math.floor(Math.random() * array.length)];

input.addEventListener("input", updateValue);
// TODO : Add 'Learning" mode with API
// WORDS
function selectWord(idx) {
  wordSelector = idx;
  const word = activeWordsSelector;
  word[idx].classList.add("word-active");
  if (idx == 0) {
    for (let i = 1; i < word.length; i++) {
      word[i].classList.remove("word-active");
      word[i].classList.remove("word-wrong");
      word[i].classList.remove("word-right");
    }
  }
}

function wordIsRight(Word) {
  let word = activeWordsSelector[Word];
  word.classList.add("word-right");
  rightWordsArray.push(word.innerText);
}

function wordIsWrong(Word) {
  let word = activeWordsSelector[Word];
  word.classList.remove("word-active");
  word.classList.add("word-wrong");
  word.style.color = "var(--theme-warning)!important";
  activeWordsSelector[wordSelector].innerHTML =
    activeWordsSelector[wordSelector].innerText;
  wrongWordsArray.push(word.innerText);
}

// Updating active word each input
function updateValue(e) {
  redoState = 0;
  if (e.target.value === " ") {
    e.target.value = "";
  }
  var subCharPrefix = activeWordsSelector[wordSelector].innerText.substr(
    0,
    e.target.value.length
  );
  var subCharSufix = activeWordsSelector[wordSelector].innerText.substr(
    e.target.value.length
  );
  if (
    activeWordsSelector[wordSelector].innerText.substr(
      0,
      e.target.value.length
    ) == e.target.value
  ) {
    activeWordsSelector[wordSelector].innerHTML =
      '<span style="color: var(--theme-primary);">' +
      subCharPrefix +
      "</span>" +
      subCharSufix;
  } else {
    activeWordsSelector[wordSelector].innerHTML =
      '<span style="color: var(--theme-warning);">' +
      subCharPrefix +
      "</span>" +
      subCharSufix;
  }
  activeWord = e.target.value;
}

// Starting timer event when typing
var startTimer = (function() {
  executed = false;
  return function() {
    const timerOverlay = document.getElementsByClassName("timer-overlay")[0];
    timerOverlay.classList.add("timer-animation");
    document.getElementsByClassName(
      "timer-animation"
    )[0].style.animationDuration = maxTimer + "s";
    if (!executed) {
      executed = true;
      setInterval(function() {
        if (!redoState) {
          if (timer < maxTimer) {
            document.getElementById("counter").innerText = timer;
            timer++;
          } else if (timer == maxTimer) {
            let actualNumberChar = 0;
            for (let i = 0; i < rightWordsArray.length; i++) {
              actualNumberChar = actualNumberChar + rightWordsArray[i].length;
            }
            let totalNumberChar = 0;
            let totalNumberArray = rightWordsArray.concat(wrongWordsArray);
            for (let i = 0; i < totalNumberArray.length; i++) {
              totalNumberChar = totalNumberChar + totalNumberArray[i].length;
            }
            numberChar = actualNumberChar;
            console.log(numberChar);
            wpmVal = Math.floor(numberChar / 4 / (maxTimer / 60));
            preVal = Math.floor((numberChar / totalNumberChar) * 100);
            document.getElementById("wpm").innerText = wpmVal;
            document.getElementById("pre").innerText = preVal;
            document.getElementById("score-share").href =
              "https://twitter.com/intent/tweet?text=J'écris " +
              wpmVal +
              " mots par minute avec une précision de " +
              preVal +
              "/100 ! Test ta rapidité sur sezi.danly.co ! #Sezi";
            document.getElementById("counter").innerText = timer;
            document
              .getElementById("word-wrapper")
              .classList.remove("appearsdown");
            document.getElementById("score").classList.remove("slidedown");
            document.getElementById("word-wrapper").classList.add("slideup");
            document.getElementById("score").classList.add("appearsup");

            timer = maxTimer + 1;
          }
        } else {
          timer = 0;
        }
      }, 1000);
    }
  };
})();

// Resetting words and timer state
function redo() {
  const timerOverlay = document.getElementsByClassName("timer-overlay")[0];
  timerOverlay.classList.remove("timer-animation");
  generateNewWords();
  selectWord(0);
  input.value = "";
  input.focus();
  document.getElementById("word-wrapper").classList.add("appearsdown");
  document.getElementById("score").classList.add("slidedown");
  document.getElementById("word-wrapper").classList.remove("slideup");
  document.getElementById("score").classList.remove("appearsup");
  redoState = 1;
  timer = 0;
  document.getElementById("counter").innerText = timer;
  wrongWordsArray.length = 0;
  rightWordsArray.length = 0;
}

// Listening to Space press
input.addEventListener("keypress", function(e) {
  var key = e.which || e.keyCode;
  if (key === 32) {
    // 13 is enter
    // code for enter
    const word = activeWordsSelector;
    if (
      word[wordSelector].innerText === activeWord &&
      word[wordSelector].innerText.length === activeWord.length
    ) {
      wordIsRight(wordSelector);
    } else {
      wordIsWrong(wordSelector);
    }
    if (wordSelector < maxWordsInBatch - 1) {
      wordSelector++;
      input.value = "";
      selectWord(wordSelector);
    } else {
      generateNewWords();
      input.value = "";
      selectWord(0);
    }
  }
});

// Call it to generate new batch of words
function generateNewWords() {
  for (let i = 0; i < maxWordsInBatch; i++) {
    activeWordsArray[i] = getRandomElement(words);
    let randomNumber = Math.random() * 100;
    if (randomNumber > 30 && randomNumber < 40) {
      activeWordsArray[i] =
        activeWordsArray[i].charAt(0).toUpperCase() +
        activeWordsArray[i].slice(1);
    }
    activeWordsSelector[i].innerText = activeWordsArray[i];
  }
}

function showPanel(arg) {
  let thisPanel = document.getElementsByClassName("panel");
  for (let i = 0; i < thisPanel.length; i++) {
    thisPanel[i].classList.remove("panel-show");
  }
  $(thisPanel[arg]).toggleClass("panel-show");
}

// Main function
$(function Main() {
  // Time set
  if (localStorage.getItem("time")) {
    setSavedTimer();
  }
  setTimer();
  if (!localStorage.getItem("theme")) {
    setThemes(1);
  }
  setThemes(localStorage.getItem("theme"));
  generateThemeThumbnails();
  generateNewWords();
  // When the user clicks anywhere outside of the modal, close it
  document.onclick = function(e) {
    if (e.target.id == "theme-button") {
      showPanel(0);
    } else if (e.target.id == "settings-button") {
      showPanel(1);
    } else {
      if (!e.target.parentNode.classList.contains("theme")) {
        if (!e.target.classList.contains("theme")) {
          if (document.getElementsByClassName("panel-show").length > 0) {
            document
              .getElementsByClassName("panel-show")[0]
              .classList.remove("panel-show");
            console.log("no");
          }
        }
      }
    }
  };
});
