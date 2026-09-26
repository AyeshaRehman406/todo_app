import './styles.css';

// ==========================================================================
// 1. Navigation & Screen Transitions
// ==========================================================================
const introScreen = document.getElementById('intro-screen');
const appWorkspace = document.getElementById('app-workspace');
const btnEnter = document.getElementById('btn-enter');
const btnEnterNav = document.getElementById('btn-enter-nav');
const btnBackIntro = document.getElementById('btn-back-intro');

function enterWorkspace() {
  introScreen.classList.add('fade-out');
  setTimeout(() => {
    introScreen.classList.add('hidden');
    appWorkspace.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('task-title-input')?.focus();
  }, 350);
}

function returnToLanding() {
  workspaceRail.classList.remove('expanded');
  appWorkspace.classList.add('hidden');
  introScreen.classList.remove('hidden');
  setTimeout(() => {
    introScreen.classList.remove('fade-out');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 20);
}

if (btnEnter) btnEnter.addEventListener('click', enterWorkspace);
if (btnEnterNav) btnEnterNav.addEventListener('click', enterWorkspace);
if (btnBackIntro) btnBackIntro.addEventListener('click', returnToLanding);

// ==========================================================================
// 2. Gemini-Style Logo Rail Toggle
// ==========================================================================
const workspaceRail = document.getElementById('workspace-rail');
const btnRailToggle = document.getElementById('btn-rail-toggle');

if (btnRailToggle) {
  btnRailToggle.addEventListener('click', () => {
    // Toggles between the slim icon strip and the expanded drawer
    workspaceRail.classList.toggle('expanded');
  });
}

// ==========================================================================
// 3. Date Helpers
// ==========================================================================
function getTodayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getTomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const today = getTodayString();
  const tomorrow = getTomorrowString();

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[parseInt(parts[1], 10) - 1];
    const day = parseInt(parts[2], 10);
    return `${month} ${day}`;
  }
  return dateStr;
}

let selectedDueDate = getTodayString();

// ==========================================================================
// 4. Task State & Persistence
// ==========================================================================
const STORAGE_KEY = 'listium_tasks_v1';
let currentFilter = 'all';

function normalizeCategory(cat) {
  if (cat === 'deep-work') return 'high';
  if (cat === 'quick-win') return 'medium';
  if (cat === 'admin') return 'low';
  if (['high', 'medium', 'low'].includes(cat)) return cat;
  return 'medium';
}

function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getStarterTasks();
    const parsed = JSON.parse(data);
    return parsed.map(task => ({
      ...task,
      category: normalizeCategory(task.category),
      dueDate: task.dueDate || getTodayString()
    }));
  } catch (err) {
    console.error('Failed to load tasks', err);
    return getStarterTasks();
  }
}

function getStarterTasks() {
  return [
    {
      id: 'task_1',
      title: 'say hello to hafsa',
      category: 'low',
      dueDate: '2026-09-30',
      completed: false,
      createdAt: Date.now()
    },
    {
      id: 'task_2',
      title: 'sleep',
      category: 'low',
      dueDate: getTodayString(),
      completed: false,
      createdAt: Date.now() - 1000
    },
    {
      id: 'task_3',
      title: 'take a bath',
      category: 'low',
      dueDate: getTomorrowString(),
      completed: true,
      createdAt: Date.now() - 2000
    },
    {
      id: 'task_4',
      title: 'complete the to do list app',
      category: 'high',
      dueDate: getTomorrowString(),
      completed: false,
      createdAt: Date.now() - 3000
    }
  ];
}

let tasks = loadTasks();

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to persist tasks', err);
  }
}

// ==========================================================================
// 5. Form Date Controls
// ==========================================================================
const btnDatePresets = document.querySelectorAll('.btn-date-preset');
const customDateInput = document.getElementById('task-due-date-custom');

btnDatePresets.forEach((btn) => {
  btn.addEventListener('click', () => {
    btnDatePresets.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    customDateInput.value = '';
    customDateInput.classList.remove('active');

    if (btn.dataset.date === 'today') {
      selectedDueDate = getTodayString();
    } else if (btn.dataset.date === 'tomorrow') {
      selectedDueDate = getTomorrowString();
    }
  });
});

if (customDateInput) {
  customDateInput.addEventListener('change', (e) => {
    if (e.target.value) {
      selectedDueDate = e.target.value;
      btnDatePresets.forEach(b => b.classList.remove('active'));
      customDateInput.classList.add('active');
    }
  });
}

// ==========================================================================
// 6. Task Management
// ==========================================================================
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const ledgerSummary = document.getElementById('ledger-summary');
const viewTitle = document.getElementById('view-title');
const viewSubtitle = document.getElementById('view-subtitle');
const railNavItems = document.querySelectorAll('.rail-nav-item');
const railPriorityItems = document.querySelectorAll('.rail-priority-item');

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) return;

  const selectedCategoryEl = document.querySelector('input[name="task-category"]:checked');
  const category = selectedCategoryEl ? selectedCategoryEl.value : 'high';

  const newTask = {
    id: 'task_' + Date.now(),
    title: title,
    category: normalizeCategory(category),
    dueDate: selectedDueDate,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  taskTitleInput.value = '';
  taskTitleInput.focus();
});

taskList.addEventListener('click', (e) => {
  const toggleBtn = e.target.closest('.task-checkbox-btn');
  const deleteBtn = e.target.closest('.btn-delete-task');
  const taskRow = e.target.closest('.task-item');

  if (!taskRow) return;
  const taskId = taskRow.dataset.id;

  if (toggleBtn) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    }
  }

  if (deleteBtn) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
  }
});

function getPriorityLabel(cat) {
  switch (cat) {
    case 'high':   return 'High Priority';
    case 'medium': return 'Medium';
    case 'low':    return 'Low';
    default:       return 'Medium';
  }
}

// ==========================================================================
// 7. Rail Filtering Controls
// ==========================================================================
railNavItems.forEach((btn) => {
  btn.addEventListener('click', () => {
    railNavItems.forEach(b => b.classList.remove('active'));
    railPriorityItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentFilter = btn.dataset.filterTarget;
    updateViewHeading(currentFilter);
    renderTasks();
  });
});

railPriorityItems.forEach((btn) => {
  btn.addEventListener('click', () => {
    railNavItems.forEach(b => b.classList.remove('active'));
    railPriorityItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentFilter = 'p-' + btn.dataset.priorityTarget;
    updateViewHeading(currentFilter);
    renderTasks();
  });
});

function updateViewHeading(filter) {
  switch (filter) {
    case 'all':
      viewTitle.textContent = 'All Tasks';
      viewSubtitle.textContent = 'Daily Ledger';
      break;
    case 'today':
      viewTitle.textContent = 'Today';
      viewSubtitle.textContent = 'Scheduled for today';
      break;
    case 'upcoming':
      viewTitle.textContent = 'Upcoming';
      viewSubtitle.textContent = 'Future deliverables';
      break;
    case 'completed':
      viewTitle.textContent = 'Completed';
      viewSubtitle.textContent = 'Archived progress';
      break;
    case 'p-high':
      viewTitle.textContent = 'High Priority';
      viewSubtitle.textContent = 'Critical Focus Items';
      break;
    case 'p-medium':
      viewTitle.textContent = 'Medium Priority';
      viewSubtitle.textContent = 'Steady progress';
      break;
    case 'p-low':
      viewTitle.textContent = 'Low Priority';
      viewSubtitle.textContent = 'Routine & upkeep';
      break;
  }
}

function updateRailCounts() {
  const today = getTodayString();
  const allCount = tasks.length;
  const todayCount = tasks.filter(t => !t.completed && t.dueDate <= today).length;
  const upcomingCount = tasks.filter(t => !t.completed && t.dueDate > today).length;
  const completedCount = tasks.filter(t => t.completed).length;

  const highCount = tasks.filter(t => !t.completed && t.category === 'high').length;
  const medCount = tasks.filter(t => !t.completed && t.category === 'medium').length;
  const lowCount = tasks.filter(t => !t.completed && t.category === 'low').length;

  document.getElementById('count-all').textContent = allCount;
  document.getElementById('count-today').textContent = todayCount;
  document.getElementById('count-upcoming').textContent = upcomingCount;
  document.getElementById('count-completed').textContent = completedCount;

  document.getElementById('count-p-high').textContent = highCount;
  document.getElementById('count-p-medium').textContent = medCount;
  document.getElementById('count-p-low').textContent = lowCount;
}

// ==========================================================================
// 8. Main Render Engine
// ==========================================================================
function renderTasks() {
  const today = getTodayString();

  let filtered = tasks;
  if (currentFilter === 'today') {
    filtered = tasks.filter(t => !t.completed && t.dueDate <= today);
  } else if (currentFilter === 'upcoming') {
    filtered = tasks.filter(t => !t.completed && t.dueDate > today);
  } else if (currentFilter === 'completed') {
    filtered = tasks.filter(t => t.completed);
  } else if (currentFilter === 'p-high') {
    filtered = tasks.filter(t => !t.completed && t.category === 'high');
  } else if (currentFilter === 'p-medium') {
    filtered = tasks.filter(t => !t.completed && t.category === 'medium');
  } else if (currentFilter === 'p-low') {
    filtered = tasks.filter(t => !t.completed && t.category === 'low');
  }

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  ledgerSummary.textContent = `${completedCount} of ${totalCount} completed`;

  updateRailCounts();

  taskList.innerHTML = '';
  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');

    const fragment = document.createDocumentFragment();

    filtered.forEach((task) => {
      const item = document.createElement('div');
      item.className = `task-item ${task.completed ? 'is-completed' : ''}`;
      item.dataset.id = task.id;

      let dueClass = '';
      if (!task.completed) {
        if (task.dueDate < today) {
          dueClass = 'is-overdue';
        } else if (task.dueDate === today) {
          dueClass = 'is-today';
        }
      }

      item.innerHTML = `
        <div class="task-main-col">
          <button class="task-checkbox-btn" type="button" aria-label="Toggle completed">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <span class="task-title-text"></span>
        </div>
        <div class="task-actions-col">
          <span class="task-due-badge ${dueClass}">${formatDisplayDate(task.dueDate)}</span>
          <span class="task-badge-tag ${task.category}">${getPriorityLabel(task.category)}</span>
          <button class="btn-delete-task" type="button" aria-label="Delete task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      item.querySelector('.task-title-text').textContent = task.title;
      fragment.appendChild(item);
    });

    taskList.appendChild(fragment);
  }
}

// Initial boot
renderTasks();