const questions = [];
let currentQuestionIndex = 0;
let viewedQuestionsCount = 1;

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById(
    "viewedQuestionsCount"
  ).textContent = `Bakılan soru sayısı: ${viewedQuestionsCount}`;
});

function updateViewedQuestionsCount() {
  viewedQuestionsCount++;
  document.getElementById(
    "viewedQuestionsCount"
  ).textContent = `Bakılan soru sayısı: ${viewedQuestionsCount}`;
}

function loadQuestionsFromFile() {
  const filePath = "isg.txt";

  const xhr = new XMLHttpRequest();
  xhr.open("GET", filePath, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      processFileContent(xhr.responseText);
      displayQuestion();
    }
  };
  xhr.send();
}

function processFileContent(fileContent) {
  const lines = fileContent.split("\n");

  for (let i = 0; i < lines.length; i += 6) {
    const questionText = lines[i]?.trim();
    const choices = (lines.slice(i + 1, i + 5) || []).map((choice) =>
      choice.trim()
    );

    // Doğru cevap
    const correctAnswerString = lines[i + 5]?.trim().toUpperCase();

    if (
      questionText &&
      choices.length === 4 &&
      correctAnswerString !== undefined
    ) {
      const correctAnswerIndex = choices.findIndex((choice) =>
        choice.toUpperCase().startsWith(correctAnswerString)
      );

      if (correctAnswerIndex !== -1) {
        questions.push({
          question: questionText,
          choices: choices,
          correctAnswer: correctAnswerIndex,
        });
      } else {
        console.error(`Hata: Doğru cevap bulunamadı - Satır: ${i + 6}`);
      }
    } else {
      console.error(
        `Hata: Soru veya doğru cevap bilgisi eksik - Satır: ${i + 6}`
      );
    }
  }
}

function toggleShowAnswer() {
  const showAnswerCheckbox = document.getElementById("showAnswerCheckbox");
  const choices = document.querySelectorAll(".choice");
  const currentQuestion = questions[currentQuestionIndex];

  if (showAnswerCheckbox.checked && currentQuestion) {
    const correctAnswerIndex = currentQuestion.correctAnswer;
    choices.forEach((choice, index) => {
      choice.classList.remove("correct", "incorrect");
    });
    choices[correctAnswerIndex].classList.add("correct");
  } else {
    choices.forEach((choice, index) => {
      choice.classList.remove("correct");
    });
  }
}

function displayQuestion() {
  const currentQuestion = questions[currentQuestionIndex];

  if (currentQuestion && currentQuestion.choices) {
    document.getElementById("question").textContent = currentQuestion.question;

    const choiceButtons = document.querySelectorAll(".choice");

    if (currentQuestion.choices.length === choiceButtons.length) {
      choiceButtons.forEach((button, index) => {
        button.textContent = currentQuestion.choices[index];
        button.classList.remove("correct", "incorrect");
      });
    } else {
      console.error("Hata: Soru şıkları eksik veya fazla.");
    }
  } else {
    console.error("Hata: Sorular yüklenirken bir sorun oluştu.");
  }

  toggleShowAnswer(); // Her soru yüklendiğinde doğru cevabı kontrol et
}

function checkAnswer(choiceIndex) {
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion || !Array.isArray(currentQuestion.choices)) {
    console.error("Hata: Soru bilgisi veya şıklar eksik.");
    return;
  }

  const correctAnswerIndex = currentQuestion.correctAnswer;

  const choices = document.querySelectorAll(".choice");

  if (correctAnswerIndex < 0 || correctAnswerIndex >= choices.length) {
    console.error("Hata: Geçersiz doğru cevap indeksi.");
    return;
  }

  choices.forEach((choice, index) => {
    choice.classList.remove("correct", "incorrect");
  });

  choices[correctAnswerIndex].classList.add("correct");

  if (choiceIndex === correctAnswerIndex) {
    choices[choiceIndex].classList.add("correct");
  } else {
    choices[choiceIndex].classList.add("incorrect");
  }
}
let selectedLanguage = "tr-TR"; // Varsayılan dil Türkçe
let speechSpeed = 1; // Varsayılan hız

function setLanguage(language) {
  selectedLanguage = language;
  console.log(`Dil seçildi: ${selectedLanguage}`);
}

function setSpeed(speed) {
  speechSpeed = Math.min(Math.max(speed, 0.5), 3); // Hızı 0.5 ile 3 arasında sınırla
  console.log(`Hız ayarlandı: ${speechSpeed}`);
}
document.getElementById("speedRange").addEventListener("input", function () {
  const speedValue = document.getElementById("speedValue");
  speedValue.textContent = this.value;
});

function readQuestionWithSettings(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = speechSpeed;
    speechSynthesis.cancel(); // Daha önceki okumayı durdur
    speechSynthesis.speak(utterance);
  } else {
    console.error("Tarayıcı sesli okuma özelliğini desteklemiyor.");
  }
}

function speakText(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  } else {
    console.error("Tarayıcı sesli okuma özelliğini desteklemiyor.");
  }
}

function readAllQuestions() {
  if (currentQuestionIndex < questions.length) {
    const currentQuestion = questions[currentQuestionIndex];
    const correctChoice =
      currentQuestion.choices[currentQuestion.correctAnswer];
    const textToRead = `${currentQuestion.question}. Doğru cevap: ${correctChoice}.`;

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead);

      // Hız ve dil ayarlarını uygulayın
      utterance.rate = speechSpeed; // Kullanıcı tarafından belirlenen hız
      utterance.lang = selectedLanguage; // Kullanıcı tarafından belirlenen dil

      // Okuma tamamlandığında bir sonraki soruya geç ve tekrar çağır
      utterance.onend = function () {
        currentQuestionIndex++;
        updateViewedQuestionsCount(); // Sayacı güncelle

        if (currentQuestionIndex < questions.length) {
          displayQuestion(); // Yeni soruyu ekranda güncelle
          readAllQuestions(); // Tekrar çağır
        } else {
          const finishMessage =
            selectedLanguage === "tr-TR"
              ? "Tüm sorular tamamlandı!"
              : "All questions are completed!";
          const finishUtterance = new SpeechSynthesisUtterance(finishMessage);
          finishUtterance.rate = speechSpeed; // Bitirme mesajı için de hızı ayarla
          finishUtterance.lang = selectedLanguage; // Bitirme mesajı için dili ayarla
          speechSynthesis.speak(finishUtterance);
          alert(finishMessage);
        }
      };

      speechSynthesis.speak(utterance);
    } else {
      console.error("Tarayıcı sesli okuma özelliğini desteklemiyor.");
    }
  } else {
    console.log("Tüm sorular zaten tamamlandı.");
  }
}

function stopReading() {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
    console.log("Sesli okuma durduruldu.");
  } else {
    console.error("Tarayıcı sesli okuma özelliğini desteklemiyor.");
  }
}

function shuffleQuestions(startIndex, endIndex) {
  if (
    isNaN(startIndex) ||
    isNaN(endIndex) ||
    startIndex < 0 ||
    endIndex >= questions.length ||
    startIndex > endIndex
  ) {
    alert("Geçerli bir aralık giriniz!");
    return;
  }

  // Belirtilen aralıktaki soruları alın
  const rangeQuestions = questions.slice(startIndex, endIndex + 1);

  // Soruları karıştır
  for (let i = rangeQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rangeQuestions[i], rangeQuestions[j]] = [
      rangeQuestions[j],
      rangeQuestions[i],
    ];
  }

  // Karışık soruları global `questions` dizisine aktar
  questions.splice(startIndex, rangeQuestions.length, ...rangeQuestions);

  // İlk soruya geçiş yap ve göster
  currentQuestionIndex = startIndex;
  displayQuestion();
}

function handleShuffle() {
  const startInput = document.getElementById("shuffleStart");
  const endInput = document.getElementById("shuffleEnd");

  const startIndex = parseInt(startInput.value, 10) - 1;
  const endIndex = parseInt(endInput.value, 10) - 1;

  shuffleQuestions(startIndex, endIndex);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
    updateViewedQuestionsCount(); // Sayaç güncelleniyor
    document
      .querySelectorAll(".choice")
      .forEach((button) => button.classList.remove("correct", "incorrect"));
  } else {
    alert("Quiz bitti!");
  }
  toggleShowAnswer();
}

function previousQuestion() {
  currentQuestionIndex--;
  if (currentQuestionIndex >= 0) {
    displayQuestion();
    updateViewedQuestionsCount(); // Sayaç güncelleniyor
    document
      .querySelectorAll(".choice")
      .forEach((button) => button.classList.remove("correct", "incorrect"));
  } else {
    currentQuestionIndex = 0;
  }
  toggleShowAnswer();
}

function goToQuestionByNumber() {
  const questionNumberInput = document.getElementById("questionNumber");
  const targetQuestionIndex = parseInt(questionNumberInput.value, 10) - 1;

  if (
    !isNaN(targetQuestionIndex) &&
    targetQuestionIndex >= 0 &&
    targetQuestionIndex < questions.length
  ) {
    currentQuestionIndex = targetQuestionIndex;
    displayQuestion();
    document
      .querySelectorAll(".choice")
      .forEach((button) => button.classList.remove("correct", "incorrect"));
  } else {
    console.error("Hata: Geçersiz soru numarası.");
  }
}

document
  .getElementById("questionNumber")
  .addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      goToQuestionByNumber();
    }
  });

document.addEventListener("contextmenu", function (event) {
  event.preventDefault();

  // nextQuestion()
  nextQuestion();
});

document.addEventListener("keydown", function (event) {
  const currentQuestion = questions[currentQuestionIndex];

  if (currentQuestion && currentQuestion.choices) {
    let choiceIndex = -1;

    switch (event.key) {
      case "q":
        choiceIndex = 0;
        break;
      case "w":
        choiceIndex = 1;
        break;
      case "e":
        choiceIndex = 2;
        break;
      case "r":
        choiceIndex = 3;
        break;
      default:
        break;
    }

    if (choiceIndex !== -1) {
      event.preventDefault(); // varsayılan davranışı engelle
      checkAnswer(choiceIndex);
    }
  }

  // Yön tuşları için kontrol ekle
  if (event.key === "ArrowLeft") {
    previousQuestion();
  } else if (event.key === "ArrowRight") {
    nextQuestion();
  }
});

document.querySelectorAll(".choice").forEach((button, index) => {
  button.addEventListener("click", function () {
    checkAnswer(index);
  });
});

// İlk soru
loadQuestionsFromFile();
