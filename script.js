const app = document.querySelector('.app');
const introInput = document.getElementById('introInput');
const mainInput = document.getElementById('mainInput');
const qaInput = document.getElementById('qaInput');
const phaseLabel = document.getElementById('phaseLabel');
const timeDisplay = document.getElementById('timeDisplay');
const progressText = document.getElementById('progressText');
const agendaList = document.getElementById('agendaList');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

let intervalId;
let isRunning = false;
let currentSegmentIndex = 0;
let remainingSeconds = 0;
let segments = [];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildSegments() {
  const data = [
    { label: 'Intro', minutes: Number(introInput.value) || 0 },
    { label: 'Main talk', minutes: Math.max(1, Number(mainInput.value) || 1) },
    { label: 'Q&A', minutes: Number(qaInput.value) || 0 }
  ];

  segments = data
    .filter((segment) => segment.minutes > 0)
    .map((segment) => ({ ...segment, totalSeconds: segment.minutes * 60 }));

  if (segments.length === 0) {
    segments = [{ label: 'Main talk', minutes: 1, totalSeconds: 60 }];
  }
}

function renderAgenda() {
  agendaList.innerHTML = '';
  segments.forEach((segment, index) => {
    const item = document.createElement('li');
    const marker = index === currentSegmentIndex ? '⬅ now' : '';
    item.textContent = `${segment.label}: ${segment.minutes} min ${marker}`.trim();
    agendaList.appendChild(item);
  });
}

function setUrgency(total, remaining) {
  if (remaining <= 15) {
    app.dataset.urgency = 'danger';
  } else if (remaining <= Math.max(30, Math.floor(total * 0.2))) {
    app.dataset.urgency = 'warning';
  } else {
    app.dataset.urgency = 'normal';
  }
}

function syncUi() {
  const current = segments[currentSegmentIndex];
  phaseLabel.textContent = current ? current.label : 'Finished';
  timeDisplay.textContent = formatTime(Math.max(remainingSeconds, 0));

  if (current) {
    setUrgency(current.totalSeconds, remainingSeconds);
    progressText.textContent = `${currentSegmentIndex + 1} / ${segments.length} segment${segments.length > 1 ? 's' : ''}`;
  } else {
    app.dataset.urgency = 'normal';
    progressText.textContent = 'Presentation complete. Great job!';
  }

  startBtn.disabled = isRunning;
  pauseBtn.disabled = !isRunning;
}

function moveToNextSegment() {
  currentSegmentIndex += 1;

  if (currentSegmentIndex >= segments.length) {
    isRunning = false;
    clearInterval(intervalId);
    syncUi();
    renderAgenda();
    return;
  }

  remainingSeconds = segments[currentSegmentIndex].totalSeconds;
  syncUi();
  renderAgenda();
}

function tick() {
  remainingSeconds -= 1;

  if (remainingSeconds < 0) {
    moveToNextSegment();
    return;
  }

  syncUi();
}

function startTimer() {
  if (isRunning) {
    return;
  }

  if (segments.length === 0) {
    resetTimer();
  }

  isRunning = true;
  intervalId = setInterval(tick, 1000);
  syncUi();
}

function pauseTimer() {
  isRunning = false;
  clearInterval(intervalId);
  syncUi();
}

function resetTimer() {
  clearInterval(intervalId);
  buildSegments();
  currentSegmentIndex = 0;
  remainingSeconds = segments[0].totalSeconds;
  isRunning = false;
  renderAgenda();
  syncUi();
}

[startBtn, pauseBtn, resetBtn].forEach((button) => {
  button.addEventListener('click', () => {
    if (button === startBtn) startTimer();
    if (button === pauseBtn) pauseTimer();
    if (button === resetBtn) resetTimer();
  });
});

[introInput, mainInput, qaInput].forEach((input) => {
  input.addEventListener('change', resetTimer);
});

resetTimer();
