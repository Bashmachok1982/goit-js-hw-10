import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const input = document.querySelector('#datetime-picker');
const startBtn = document.querySelector('[data-start]');
const daysCard = document.getElementById('days-card');
const hoursCard = document.getElementById('hours-card');
const minutesCard = document.getElementById('minutes-card');
const secondsCard = document.getElementById('seconds-card');
const tickSound = document.getElementById('tick-sound');

let userSelectedDate = null;
let timerId = null;
let totalTime = 0;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  clickOpens: true,

  onClose(selectedDates) {
    const selected = selectedDates[0];
    if (!selected || selected <= new Date()) {
      iziToast.error({
        title: 'Ошибка',
        message: 'Please choose a date in the future',
        position: 'topRight',
      });
      startBtn.disabled = true;
      userSelectedDate = null;
    } else {
      userSelectedDate = selected;
      startBtn.disabled = false;
    }
  },
};

flatpickr(input, options);

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

function addLeadingZero(value, digits = 2) {
  return String(value).padStart(digits, '0');
}

function flipCard(card, newValue) {
  const frontValue = card.querySelector('.flip-front .value');
  if (frontValue.textContent === newValue) return;

  const backValue = card.querySelector('.flip-back .value');
  backValue.textContent = newValue;
  card.classList.add('flipped');

  setTimeout(() => {
    frontValue.textContent = newValue;
    card.classList.remove('flipped');
  }, 300);
}

function playTick() {
  tickSound.currentTime = 0;
  tickSound.volume = 1.0;
  tickSound.play();
}

function updateInterface({ days, hours, minutes, seconds }) {
  flipCard(daysCard, addLeadingZero(days, 3));
  flipCard(hoursCard, addLeadingZero(hours));
  flipCard(minutesCard, addLeadingZero(minutes));
  flipCard(secondsCard, addLeadingZero(seconds));
}

function updateTimer() {
  const now = new Date();
  const timeLeft = userSelectedDate - now;

  if (timeLeft <= 0) {
    clearInterval(timerId);
    updateInterface({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    setCircleDasharray(0);
    input.disabled = false;
    return;
  }

  const time = convertMs(timeLeft);
  updateInterface(time);
  setCircleDasharray(timeLeft / totalTime);
  playTick();
}

const FULL_DASH_ARRAY = 565;
function setCircleDasharray(ratio) {
  const dashArray = `${(ratio * FULL_DASH_ARRAY).toFixed(0)} 565`;
  document
    .getElementById('base-timer-path-remaining')
    .setAttribute('stroke-dasharray', dashArray);
}

startBtn.addEventListener('click', () => {
  if (!userSelectedDate) return;

  tickSound.currentTime = 0;
  tickSound.volume = 1.0;
  tickSound.play();

  totalTime = userSelectedDate - new Date();
  setCircleDasharray(1);

  startBtn.disabled = true;
  input.disabled = true;

  updateTimer();
  timerId = setInterval(updateTimer, 1000);
});

startBtn.disabled = true;
