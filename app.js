'use strict';

const form = document.forms.addTask;
const list = document.querySelector('.list-group');
const searchField = document.querySelector('.seach-task');
const selectTheme = document.querySelector('#themeSelect');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = [];
const themes = {
  blue: {
    '--base-text-color': '#212529',
    '--header-bg': '#007bff',
    '--header-text-color': '#fff',
    '--default-btn-bg': '#007bff',
    '--default-btn-text-color': '#fff',
    '--default-btn-hover-bg': '#0069d9',
    '--default-btn-border-color': '#0069d9',
    '--danger-btn-bg': '#dc3545',
    '--danger-btn-text-color': '#fff',
    '--danger-btn-hover-bg': '#bd2130',
    '--danger-btn-border-color': '#dc3545',
    '--input-border-color': '#ced4da',
    '--input-bg-color': '#fff',
    '--input-text-color': '#495057',
    '--input-focus-bg-color': '#fff',
    '--input-focus-text-color': '#495057',
    '--input-focus-border-color': '#80bdff',
    '--input-focus-box-shadow': '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
  },
  default: {
    '--base-text-color': '#212529',
    '--header-bg': '#343a40',
    '--header-text-color': '#fff',
    '--default-btn-bg': '#58616b',
    '--default-btn-text-color': '#fff',
    '--default-btn-hover-bg': '#292d31',
    '--default-btn-border-color': '#343a40',
    '--default-btn-focus-box-shadow': '0 0 0 0.2rem rgba(141, 143, 146, 0.25)',
    '--danger-btn-bg': '#b52d3a',
    '--danger-btn-text-color': '#fff',
    '--danger-btn-hover-bg': '#88222c',
    '--danger-btn-border-color': '#88222c',
    '--input-border-color': '#ced4da',
    '--input-bg-color': '#fff',
    '--input-text-color': '#495057',
    '--input-focus-bg-color': '#fff',
    '--input-focus-text-color': '#495057',
    '--input-focus-border-color': '#78818a',
    '--input-focus-box-shadow': '0 0 0 0.2rem rgba(141, 143, 146, 0.25)',
  },
};

form.addEventListener('submit', handleSubmit);
list.addEventListener('click', handleTaskBtns);
selectTheme.addEventListener('change', (e) => handleSelectTheme(e.target.value));
searchField.addEventListener('input', renderActiveFilter);
filterBtns.forEach((btn) =>
  btn.addEventListener('click', (e) => {
    handleFilter(e.target.name, btn);
    searchField.value = '';
  })
);
getDataLS();
handleFilter();

function handleSubmit(e) {
  e.preventDefault();

  const title = e.target.title.value.trim();

  if (!title) {
    alert('Введите задачу');
    e.target.title.value = '';
    return;
  }
  addTask(title);

  e.target.reset();
  e.target.title.focus();
}

function addTask(title) {
  const newTask = { id: Math.random(), title, completed: false };
  tasks.unshift(newTask);
  setDataLS();
  searchField.value = '';
  renderActiveFilter();
}

function handleTaskBtns(e) {
  const id = +e.target.parentElement.dataset.id;
  if (e.target.classList.contains('delete-btn')) {
    removeTask(id);
  }
  if (e.target.classList.contains('completed-btn')) {
    completedTask(id);
  }
}

function removeTask(id) {
  tasks = tasks.filter((el) => el.id !== id);
  setDataLS();
  renderActiveFilter();
}

function completedTask(id) {
  tasks = tasks.map((el) => (el.id === id ? { ...el, completed: !el.completed } : el));
  setDataLS();
  renderActiveFilter();
}

function renderActiveFilter() {
  filterBtns.forEach(
    (btn) =>
      btn.classList.contains('active') &&
      handleFilter(btn.name, btn, searchField.value.toLowerCase())
  );
}

function handleFilter(name = 'all', btn = filterBtns[0], search = '') {
  filterBtns.forEach((el) => el.classList.remove('active'));
  disabledFilterBtns();
  switch (name) {
    case 'all': {
      search
        ? renderTasks(tasks.filter((el) => el.title.toLowerCase().includes(search)))
        : renderTasks(tasks);
      btn.classList.add('active');
      return;
    }
    case 'completed': {
      const filtered = tasks.filter((el) => el.completed);
      search
        ? renderTasks(filtered.filter((el) => el.title.toLowerCase().includes(search)))
        : renderTasks(filtered);
      btn.classList.add('active');
      return;
    }
    case 'work': {
      const filtered = tasks.filter((el) => !el.completed);
      search
        ? renderTasks(filtered.filter((el) => el.title.toLowerCase().includes(search)))
        : renderTasks(filtered);
      btn.classList.add('active');
      return;
    }
    default: {
      renderTasks(tasks);
    }
  }
}

function renderTasks(tasks) {
  const fragment = tasks.length
    ? tasks.reduce((acc, el) => (acc += htmlTaskTemplate(el)), '')
    : htmlTaskTemplate();

  list.innerHTML = '';
  list.insertAdjacentHTML('afterbegin', fragment);
}

function disabledFilterBtns() {
  if (!tasks.length) {
    filterBtns.forEach((btn) => (btn.disabled = true));
  } else {
    filterBtns.forEach((btn) => (btn.disabled = false));
  }
}

function handleSelectTheme(name) {
  const objTheme = themes[name];
  Object.entries(objTheme).forEach(([key, val]) =>
    document.documentElement.style.setProperty(key, val)
  );
  localStorage.setItem('theme', name);
  selectTheme.value = name;
}

function setDataLS() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getDataLS() {
  const data = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = [...data];
  handleSelectTheme(localStorage.getItem('theme') || 'default');
}

function htmlTaskTemplate(data = {}) {
  if (!data.id) {
    return '<h2 class="emptyTasks">Задач нет</h2>';
  }
  return `
    <li class="list-group-item d-flex align-items-center flex-wrap mt-2" data-id="${data.id}">
      <span style="font-weight: 700;">${data.title}</span>
      <button class="btn btn-danger ml-auto delete-btn">Удалить</button>
      <button class="btn btn-success ml-2 completed-btn">Выполнено</button>
      <span class="completed ${data.completed && 'show'}">Выполнено</span>
    </li>
  `;
}
