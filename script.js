const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const prioritySelect = document.querySelector("#priority-select");
const inputError = document.querySelector("#input-error");
const taskList = document.querySelector("#task-list");
const emptyMessage = document.querySelector("#empty-message");
const filterStatusBtns = document.querySelectorAll(".controls-filter-btn");
const filterPrioritySelect = document.querySelector("#filter-priority-select");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentStatusFilter = 'all';
let currentPriorityFilter = 'all';

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter((task) => {
        const matchesStatus =
            currentStatusFilter === 'all' ||
            (currentStatusFilter === 'active' && !task.completed) ||
            (currentStatusFilter === 'completed' && task.completed);
        const matchesPriority =
            currentPriorityFilter === 'all' ||
            task.priority === currentPriorityFilter;

        return matchesStatus && matchesPriority;
    })

    if (filteredTasks.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
    }

    filteredTasks.forEach((task) => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? ' completed' : ''} priority-${task.priority}`;
        li.setAttribute('data-id', task.id);

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task as completed">
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="task-badge ${task.priority}">${task.priority}</span>
            </div>
            <button class="task-delete-btn" aria-label="Delete task">×</button>
        `;

        taskList.append(li);

    })
}

function escapeHtml(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();

    if (text === "") {
        inputError.textContent = 'Task description cannot be empty';
        return;
    }

    inputError.textContent = '';

    const newTask = {
        id: Date.now().toString(),
        text: text,
        priority: prioritySelect.value,
        completed: false,
    }

    tasks.unshift.call(tasks, newTask);
    saveTasks();
    renderTasks();

    taskInput.value = "";
    prioritySelect.value = "medium";
});

taskList.addEventListener("click", (e) => {
    const li = e.target.closest('.task-item');
    if (!li) return;
    const id = li.getAttribute('data-id');

    if (e.target.classList.contains('task-checkbox')) {
        tasks = tasks.map(task => task.id === id ? {...task, completed: e.target.checked } : task);
        saveTasks();
        renderTasks();
    }

    if (e.target.classList.contains('task-delete-btn')) {
        tasks = tasks.filter(task => task.id !== id)
        saveTasks();
        renderTasks();
    }
})

filterStatusBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterStatusBtns.forEach(b => b.classList.remove('controls-filter-btn-active'));
        btn.classList.add('controls-filter-btn-active');
        currentStatusFilter = btn.getAttribute('data-filter');
        renderTasks();
    })
})

filterPrioritySelect.addEventListener('change', (e) => {
    currentPriorityFilter = e.target.value;
    renderTasks();
});

renderTasks();
