let firstCard = null;
let secondCard = null;
let cards = [];
let lockBoard = false;
let matchesFound = 0;
const totalPairs = 3;
let clickCount = 0;
let timeLeftSec = 60;
let timerInterval;
let limit = 100;
let offset = Math.floor(Math.random() * limit);

function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function setup() {
  $(".card").on("click", function () {
    if (clickCount == 0) startTimer();
    clickCount++;
    updateStatus();

    if (lockBoard) return;

    if ($(this).hasClass("flip")) return;

    $(this).addClass("flip");

    if (!firstCard) {
      firstCard = $(this);
      return;
    }

    secondCard = $(this);
    lockBoard = true;

    const firstImg = firstCard.find(".card-back img")[0];
    const secondImg = secondCard.find(".card-back img")[0];


    if (firstImg.src === secondImg.src) {
      firstCard.off("click");
      secondCard.off("click");
      matchesFound++;
      resetBoard();

      if (matchesFound === totalPairs) {
        setTimeout(() => {
          alert("🎉 You win!");
          resetGame();
        }, 300);
      }
    } else {
      setTimeout(() => {
        firstCard.removeClass("flip");
        secondCard.removeClass("flip");
        resetBoard();
      }, 1000);
    }
  });
}

function updateStatus() {
  $("#click-count").text(clickCount);
  $("#matched-count").text(matchesFound);
  $("#pairs-left").text(totalPairs - matchesFound);
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeftSec = 60;
  $("#timer").text(timeLeftSec);
  timerInterval = setInterval(() => {
    timeLeftSec--;
    $("#timer").text(timeLeftSec);
    if (timeLeftSec <= 0) {
      alert("⏰ Time's up! Try again.");
      resetGame();
    }
  }, 1000);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function displayCards() {
  const board = $("#game-board");
  board.empty();

  try {
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    let pokelist = await response.json();

    cards = [];
    for (const pokemon of pokelist.results.slice(0, totalPairs)) {
      let currentPoke = await fetch(pokemon.url);
      let details = await currentPoke.json();
      let name = details.name;
      let imageUrl = details.sprites.other['official-artwork'].front_default;

      cards.push({ name, imageUrl });
      cards.push({ name, imageUrl });
    }
    shuffleArray(cards);

    cards.forEach((card, index) => {
      const cardElement = $(`
        <div class="card" data-index="${index}">
          <div class="card-inner">
            <div class="card-front">
              <img class="card-front" src="back.webp" alt="">
            </div>
            <div class="card-back">
              <img src="${card.imageUrl}" class="card-img-top" alt="${card.name}">
            </div>
          </div>
        </div>
      `);
      board.append(cardElement);
    });

    setup();
  }catch (error) {
    console.error("Failed to load Pokémon:", error);
  }
}

function resetGame() {
  offset = Math.floor(Math.random() * limit)
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchesFound = 0;
  clickCount = 0;
  timeLeftSec = 60;
  $("#timer").text(timeLeftSec);
  clearInterval(timerInterval);
  updateStatus();
  displayCards();
}

$(document).ready(() => {
  updateStatus();
  displayCards();
});
