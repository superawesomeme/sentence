const welcomeLesson = {
  title: "Welcome / Bienvenido",
  steps: [
    { english: "Welcome to Sentence Builder", spanish: "Bienvenido a Sentence Builder", type: "vocab" },
    { english: "Use the dropdown menu above", spanish: "Usa el menú desplegable de arriba", type: "vocab" },
    { english: "To select a lesson", spanish: "Para seleccionar una lección", type: "vocab" },
    { english: "Use the dropdown menu above to select a lesson", spanish: "Usa el menú desplegable de arriba para seleccionar una lección", type: "build" },
    { english: "Or click 'Maker'", spanish: "O haz clic en 'Maker'", type: "vocab" },
    { english: "To build your own", spanish: "Para crear la tuya", type: "vocab" },
    { english: "Or click 'Maker' to build your own", spanish: "O haz clic en 'Maker' para crear la tuya", type: "build" }
  ]
};

let activeLesson = { title: "Loading...", steps: [] };
let currentStepIndex = 0;
let isRevealed = false;

const lessonSelect = document.getElementById('lessonSelect');
const fileInput = document.getElementById('fileInput');
const viewPlayerBtn = document.getElementById('viewPlayerBtn');
const viewMakerBtn = document.getElementById('viewMakerBtn');
const playerView = document.getElementById('playerView');
const makerView = document.getElementById('makerView');

const lessonTitleDisplay = document.getElementById('lessonTitleDisplay');
const badgeStepType = document.getElementById('badgeStepType');
const englishText = document.getElementById('englishText');
const spanishText = document.getElementById('spanishText');
const stepCounter = document.getElementById('stepCounter');
const progressBar = document.getElementById('progressBar');
const historyList = document.getElementById('historyList');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const iconLearn = `<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`;
const iconBuild = `<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h5.25V15.75H13.5V10.5H18.75V5.25" /></svg>`;
const iconRecall = `<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`;

availableLessons.sort((a, b) => a.name.localeCompare(b.name));
availableLessons.forEach(lesson => {
  const option = document.createElement('option');
  option.value = lesson.path;
  option.textContent = lesson.name;
  lessonSelect.appendChild(option);
});

async function loadLessonFromPath(path) {
  if (!path) return;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Network error loading lesson');
    const data = await response.json();
    setLesson(data);
  } catch (err) {
    console.warn('Direct fetch failed. Loading fallback placeholder:', err);
    setLesson({
      title: "Error Loading Lesson",
      steps: [
        { english: "Please check your network or select a valid file.", spanish: "Por favor compruebe su red o seleccione un archivo válido.", type: "vocab" }
      ]
    });
  }
}

function setLesson(data) {
  activeLesson = data;
  currentStepIndex = 0;
  isRevealed = false;
  lessonTitleDisplay.textContent = activeLesson.title || "Sentence Builder";
  renderPlayer();
  populateMakerFromLesson(activeLesson);
}

function renderPlayer() {
  if (!activeLesson.steps || activeLesson.steps.length === 0) return;

  const step = activeLesson.steps[currentStepIndex];
  const isVocab = step.type === 'vocab';

  englishText.textContent = step.english;
  stepCounter.textContent = `Step ${currentStepIndex + 1} of ${activeLesson.steps.length}`;
  progressBar.style.width = `${((currentStepIndex + 1) / activeLesson.steps.length) * 100}%`;

  let textColorClass = "text-purple-600";
  if (isVocab) {
    textColorClass = "text-blue-600";
  } else if (step.type === 'recall') {
    textColorClass = "text-emerald-600";
  }

  let visibilityClass = "";
  if (!isVocab && !isRevealed) {
    visibilityClass = "invisible";
  }

  spanishText.className = `text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-snug min-h-[1.3em] ${textColorClass} ${visibilityClass}`;
  spanishText.textContent = step.spanish;

  if (isVocab) {
    isRevealed = true;
    badgeStepType.innerHTML = iconLearn + "Learn";
    badgeStepType.className = "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase bg-blue-100 text-blue-700 shadow-sm";
  } else if (step.type === 'recall') {
    badgeStepType.innerHTML = iconRecall + "Recall";
    badgeStepType.className = "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase bg-emerald-100 text-emerald-700 shadow-sm";
  } else {
    badgeStepType.innerHTML = iconBuild + "Build";
    badgeStepType.className = "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase bg-purple-100 text-purple-700 shadow-sm";
  }

  prevBtn.disabled = currentStepIndex === 0;

  historyList.innerHTML = '';
  for (let i = 0; i <= currentStepIndex; i++) {
    const hStep = activeLesson.steps[i];
    const isCurrent = i === currentStepIndex;
    const hStepIsVocab = hStep.type === 'vocab';
    const item = document.createElement('div');
    
    item.className = `p-3 rounded-xl border text-xs transition-all ${
      isCurrent 
        ? 'bg-blue-50/70 border-blue-200 shadow-sm' 
        : 'bg-white border-slate-200/60 opacity-75 cursor-pointer hover:opacity-100 hover:bg-white hover:border-slate-300'
    }`;
    
    let spanishDisplay = hStep.spanish;
    if (isCurrent && !hStepIsVocab && !isRevealed) {
      spanishDisplay = "• • • • •";
    }

    item.innerHTML = `
      <p class="font-bold text-slate-800">${hStep.english}</p>
      <p class="font-semibold text-blue-600 mt-0.5">${spanishDisplay}</p>
    `;

    if (!isCurrent) {
      item.addEventListener('click', () => {
        currentStepIndex = i;
        isRevealed = true;
        renderPlayer();
      });
    }

    historyList.appendChild(item);
  }
  historyList.scrollTop = historyList.scrollHeight;
}

function handleNext() {
  const step = activeLesson.steps[currentStepIndex];
  const isHiddenType = step.type === 'build' || step.type === 'recall';
  
  if (isHiddenType && !isRevealed) {
    isRevealed = true;
    renderPlayer();
  } else if (currentStepIndex < activeLesson.steps.length - 1) {
    currentStepIndex++;
    isRevealed = false;
    renderPlayer();
  }
}

function handlePrev() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    isRevealed = true;
    renderPlayer();
  }
}

nextBtn.addEventListener('click', handleNext);
prevBtn.addEventListener('click', handlePrev);

window.addEventListener('keydown', (e) => {
  if (makerView.classList.contains('hidden')) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  }
});

lessonSelect.addEventListener('change', (e) => {
  if (e.target.value) {
    loadLessonFromPath(e.target.value);
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      setLesson(parsed);
      lessonSelect.value = ""; 
    } catch (err) {
      alert('Invalid JSON file format.');
    }
  };
  reader.readAsText(file);
});

viewPlayerBtn.addEventListener('click', () => {
  playerView.classList.remove('hidden');
  playerView.classList.add('flex');
  makerView.classList.add('hidden');
  makerView.classList.remove('flex');
  viewPlayerBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-sm";
  viewMakerBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900";
  renderPlayer();
});

viewMakerBtn.addEventListener('click', () => {
  makerView.classList.remove('hidden');
  makerView.classList.add('flex');
  playerView.classList.add('hidden');
  playerView.classList.remove('flex');
  viewMakerBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-sm";
  viewPlayerBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900";
});

const makerLessonTitle = document.getElementById('makerLessonTitle');
const makerTableBody = document.getElementById('makerTableBody');
const addRowBtn = document.getElementById('addRowBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');

function populateMakerFromLesson(lesson) {
  makerLessonTitle.value = lesson.title || "";
  makerTableBody.innerHTML = '';
  (lesson.steps || []).forEach(step => addMakerRow(step.english, step.spanish, step.type));
}

function addMakerRow(english = "", spanish = "", type = "vocab") {
  const tr = document.createElement('tr');
  const rowCount = makerTableBody.children.length + 1;
  tr.innerHTML = `
    <td class="p-3 text-center text-xs font-bold text-slate-400 row-number">${rowCount}</td>
    <td class="p-2"><input type="text" value="${english}" placeholder="English" class="maker-eng w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500"></td>
    <td class="p-2"><input type="text" value="${spanish}" placeholder="Español" class="maker-esp w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500"></td>
    <td class="p-2">
      <select class="maker-type w-full px-3 py-1.5 border border-slate-200 rounded-lg font-semibold outline-none focus:border-blue-500">
        <option value="vocab" ${type === 'vocab' ? 'selected' : ''}>Learn</option>
        <option value="build" ${type === 'build' ? 'selected' : ''}>Build</option>
        <option value="recall" ${type === 'recall' ? 'selected' : ''}>Recall</option>
      </select>
    </td>
    <td class="p-2 text-center">
      <button class="delete-row-btn text-rose-500 hover:text-rose-700 font-bold p-1">×</button>
    </td>
  `;
  tr.querySelector('.delete-row-btn').addEventListener('click', () => {
    tr.remove();
    refreshRowNumbers();
  });
  makerTableBody.appendChild(tr);
}

function refreshRowNumbers() {
  Array.from(makerTableBody.querySelectorAll('.row-number')).forEach((td, idx) => {
    td.textContent = idx + 1;
  });
}

addRowBtn.addEventListener('click', () => addMakerRow());

exportJsonBtn.addEventListener('click', () => {
  const rows = makerTableBody.querySelectorAll('tr');
  const steps = [];
  rows.forEach(r => {
    const eng = r.querySelector('.maker-eng').value.trim();
    const esp = r.querySelector('.maker-esp').value.trim();
    const type = r.querySelector('.maker-type').value;
    if (eng && esp) steps.push({ english: eng, spanish: esp, type });
  });

  const lessonData = {
    title: makerLessonTitle.value.trim() || "Untitled Lesson",
    steps
  };

  const blob = new Blob([JSON.stringify(lessonData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${lessonData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Initialise with the Welcome dummy lesson
setLesson(welcomeLesson);