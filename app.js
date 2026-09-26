import './styles.css';

// ==========================================================================
// 1. Theme Engine & Local Storage Persistence
// ==========================================================================
const THEME_STORAGE_KEY = 'listium_theme_v1';
const btnThemeToggle = document.getElementById('btn-theme-toggle');
const themeLabelText = document.querySelector('.theme-label-text');

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  if (themeLabelText) {
    themeLabelText.textContent = theme === 'dark' ? 'Light Theme' : 'Dark Theme';
  }
}

applyTheme(getPreferredTheme());

if (btnThemeToggle) {
  btnThemeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

// ==========================================================================
// 2. Navigation & Screen Transitions
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
// 3. Gemini-Style Logo Rail Toggle
// ==========================================================================
const workspaceRail = document.getElementById('workspace-rail');
const btnRailToggle = document.getElementById('btn-rail-toggle');

if (btnRailToggle) {
  btnRailToggle.addEventListener('click', () => {
    workspaceRail.classList.toggle('expanded');
  });
}

// ==========================================================================
// 4. Live Landing Page Showcase Simulator Loop
// ==========================================================================
function startLiveLandingSimulation() {
  const animCheck = document.getElementById('demo-anim-check');
  const animTask = document.getElementById('demo-anim-task');
  const typingText = document.getElementById('demo-typing-text');
  if (!animCheck || !animTask || !typingText) return;

  const phrase = 'Publish updated roadmap milestone';
  let charIndex = 0;
  let isDeleting = false;
  let checkCompleted = false;

  function tick() {
    // 1. Typing animation simulation
    if (!isDeleting && charIndex <= phrase.length) {
      typingText.textContent = phrase.substring(0, charIndex);
      charIndex++;
      setTimeout(tick, 90);
    } else if (!isDeleting && charIndex > phrase.length) {
      // Pause after full typing, then complete the sample task
      setTimeout(() => {
        checkCompleted = !checkCompleted;
        if (checkCompleted) {
          animCheck.classList.add('filled');
          animCheck.textContent = '✓';
          animTask.classList.add('completed');
        } else {
          animCheck.classList.remove('filled');
          animCheck.textContent = '';
          animTask.classList.remove('completed');
        }
        isDeleting = true;
        setTimeout(tick, 1200);
      }, 1000);
    } else if (isDeleting && charIndex >= 0) {
      typingText.textContent = phrase.substring(0, charIndex);
      charIndex--;
      setTimeout(tick, 40);
    } else {
      isDeleting = false;
      charIndex = 0;
      setTimeout(tick, 600);
    }
  }

  tick();
}

startLiveLandingSimulation();

// ==========================================================================
// 5. Date Helpers
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
// 6. Task State & Persistence
// ==========================================================================
const STORAGE_KEY = 'listium_tasks_v1';
let currentFilter = 'all';
let editingTaskId = null;

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
      title: 'Review and reply to pending client inquiries',
      category: 'low',
      dueDate: getTodayString(),
      completed: false,
      createdAt: Date.now()
    },
    {
      id: 'task_2',
      title: 'Prepare clean project presentation slides',
      category: 'medium',
      dueDate: getTodayString(),
      completed: false,
      createdAt: Date.now() - 1000
    },
    {
      id: 'task_3',
      title: 'Complete production task engine sprint',
      category: 'high',
      dueDate: getTomorrowString(),
      completed: true,
      createdAt: Date.now() - 2000
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
// 7. Form Date Controls
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
// 8. Task Management & Inline Editing
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

function cyclePriority(currentCat) {
  if (currentCat === 'high') return 'medium';
  if (currentCat === 'medium') return 'low';
  return 'high';
}

taskList.addEventListener('click', (e) => {
  const toggleBtn = e.target.closest('.task-checkbox-btn');
  const deleteBtn = e.target.closest('.btn-delete-task');
  const editBtn = e.target.closest('.btn-edit-task');
  const saveBtn = e.target.closest('.btn-save-task');
  const badgeBtn = e.target.closest('.task-badge-tag');
  const taskRow = e.target.closest('.task-item');

  if (!taskRow) return;
  const taskId = taskRow.dataset.id;
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  if (toggleBtn) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    return;
  }

  if (deleteBtn) {
    tasks = tasks.filter(t => t.id !== taskId);
    if (editingTaskId === taskId) editingTaskId = null;
    saveTasks();
    renderTasks();
    return;
  }

  if (badgeBtn) {
    task.category = cyclePriority(task.category);
    saveTasks();
    renderTasks();
    return;
  }

  if (editBtn) {
    editingTaskId = taskId;
    renderTasks();
    const editInput = taskRow.querySelector('.task-edit-input');
    if (editInput) {
      editInput.focus();
      editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }
    return;
  }

  if (saveBtn) {
    const editInput = taskRow.querySelector('.task-edit-input');
    if (editInput) {
      saveInlineEdit(taskId, editInput.value);
    }
  }
});

taskList.addEventListener('dblclick', (e) => {
  const titleText = e.target.closest('.task-title-text');
  const taskRow = e.target.closest('.task-item');
  if (titleText && taskRow) {
    editingTaskId = taskRow.dataset.id;
    renderTasks();
    const editInput = taskRow.querySelector('.task-edit-input');
    if (editInput) {
      editInput.focus();
      editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }
  }
});

taskList.addEventListener('keydown', (e) => {
  if (!e.target.classList.contains('task-edit-input')) return;
  const taskRow = e.target.closest('.task-item');
  if (!taskRow) return;
  const taskId = taskRow.dataset.id;

  if (e.key === 'Enter') {
    e.preventDefault();
    saveInlineEdit(taskId, e.target.value);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    editingTaskId = null;
    renderTasks();
  }
});

function saveInlineEdit(taskId, newTitle) {
  const cleanTitle = newTitle.trim();
  const task = tasks.find(t => t.id === taskId);
  if (task && cleanTitle) {
    task.title = cleanTitle;
    saveTasks();
  }
  editingTaskId = null;
  renderTasks();
}

function getPriorityLabel(cat) {
  switch (cat) {
    case 'high':   return 'High Priority';
    case 'medium': return 'Medium';
    case 'low':    return 'Low';
    default:       return 'Medium';
  }
}

// ==========================================================================
// 9. Rail Filtering Controls
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
// 10. Main Render Engine
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

      const isEditing = editingTaskId === task.id;

      item.innerHTML = `
        <div class="task-main-col">
          <button class="task-checkbox-btn" type="button" aria-label="Toggle completed">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>

          ${
            isEditing
              ? `<input type="text" class="task-edit-input" value="${task.title.replace(/"/g, '&quot;')}" />`
              : `<span class="task-title-text" title="Double-click to edit">${task.title}</span>`
          }
        </div>

        <div class="task-actions-col">
          <span class="task-due-badge ${dueClass}">${formatDisplayDate(task.dueDate)}</span>
          <span class="task-badge-tag ${task.category}" title="Click to cycle priority">${getPriorityLabel(task.category)}</span>
          
          ${
            isEditing
              ? `<button class="btn-icon-action btn-save-task" type="button" aria-label="Save changes" title="Save changes (Enter)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>`
              : `<button class="btn-icon-action btn-edit-task" type="button" aria-label="Edit task" title="Edit task">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>`
          }

          <button class="btn-icon-action btn-delete-task" type="button" aria-label="Delete task" title="Delete task">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      fragment.appendChild(item);
    });

    taskList.appendChild(fragment);
  }
}

renderTasks();