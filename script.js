const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filters button");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderTasks(filter = "all") {
  taskList.innerHTML = "";

  tasks
    .filter(task => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true;
    })
    .forEach((task, index) => {
      const li = document.createElement("li");
      li.className = task.completed ? "completed" : "";
      li.innerHTML = `
        <div class="task-info">
          <strong>${task.text}</strong><br/>
          <small>${new Date(task.date).toLocaleString()}</small>
        </div>
        <span>
          <button onclick="toggleTask(${index})">✔️</button>
          <button onclick="editTask(${index})">✏️</button>
          <button onclick="deleteTask(${index})">🗑️</button>
        </span>
      `;
      taskList.appendChild(li);
    });
}

function addTask() {
  const text = taskInput.value.trim();
  const date = taskDate.value;

  if (text && date) {
    const task = { text, date, completed: false };
    tasks.push(task);
    saveAndRender();
    taskInput.value = "";
    taskDate.value = "";
    scheduleReminder(task);
  }
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveAndRender();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks(document.querySelector(".filters .active").dataset.filter);
}

function scheduleReminder(task) {
  const timeUntilTask = new Date(task.date).getTime() - new Date().getTime() - 60000; // 1 minuto antes
  if (timeUntilTask > 0) {
    setTimeout(() => {
      if (!task.completed) {
        // Exemplo de pop-up via Notification API
        if (Notification.permission === "granted") {
          new Notification(`⏰ Lembrete: Tarefa "${task.text}" começa em 1 minuto!`);
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification(`⏰ Lembrete: Tarefa "${task.text}" começa em 1 minuto!`);
            }
          });
        } else {
          alert(`⏰ Lembrete: Tarefa "${task.text}" começa em 1 minuto!`);
        }
      }
    }, timeUntilTask);
  }
}

// Reprogramar lembretes para tarefas existentes
tasks.forEach(task => {
  if (!task.completed) {
    scheduleReminder(task);
  }
});

addBtn.addEventListener("click", addTask);

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filters .active").classList.remove("active");
    btn.classList.add("active");
    renderTasks(btn.dataset.filter);
  });
});

// Função para editar tarefa
function editTask(index) {
  const newText = prompt("Editar tarefa:", tasks[index].text);
  if (newText && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    saveAndRender();
  }
}

renderTasks();
