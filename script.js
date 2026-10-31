const KEY = "solo-leveling-system";

// Dati iniziali di esempio con le aree del tuo schizzo
const defaultAreas = [
    {
        id: "giornata",
        name: "GIORNATA",
        tasks: [
            { id: "1", text: "Revisione quest mattutine", time: "09:00", priority: "Media", done: false },
            { id: "2", text: "Pianificare obiettivi", time: "11:30", priority: "Bassa", done: true }
        ]
    },
    { id: "salute", name: "SALUTE", tasks: [] },
    { id: "scuola", name: "SCUOLA", tasks: [] },
    { id: "workout", name: "WORKOUT", tasks: [] }
];

let areas = JSON.parse(localStorage.getItem(KEY)) || defaultAreas;
let activeAreaId = areas[0]?.id || null;

const save = () => {
    localStorage.setItem(KEY, JSON.stringify(areas));
    render();
};

// Calcolo dell'EXP (ogni task fatta = 25 EXP)
function updateExp() {
    const allTasks = areas.flatMap(a => a.tasks);
    const doneCount = allTasks.filter(t => t.done).length;
    const exp = doneCount * 25;
    const maxExp = 100;

    const rankEl = document.getElementById("player-rank");
    const expText = document.getElementById("exp-text");
    const expFill = document.getElementById("exp-bar-fill");

    if (exp >= 200) rankEl.textContent = "RANK S";
    else if (exp >= 100) rankEl.textContent = "RANK A";
    else if (exp >= 50) rankEl.textContent = "RANK C";
    else rankEl.textContent = "RANK E";

    expText.textContent = `${exp} EXP`;
    const pct = Math.min((exp % maxExp), 100);
    expFill.style.width = `${pct}%`;
}

// Disegna l'interfaccia completa
function render() {
    updateExp();

    const tabsList = document.getElementById("tabs-list");
    tabsList.innerHTML = "";

    // Se l'area attiva non esiste più, seleziona la prima
    if (!areas.some(a => a.id === activeAreaId) && areas.length > 0) {
        activeAreaId = areas[0].id;
    }

    // 1. Disegna i tab orizzontali
    areas.forEach(area => {
        const btn = document.createElement("button");
        btn.className = `tab-btn ${area.id === activeAreaId ? "active" : ""}`;
        btn.textContent = area.name;
        btn.onclick = () => {
            activeAreaId = area.id;
            render();
        };
        tabsList.appendChild(btn);
    });

    const activeArea = areas.find(a => a.id === activeAreaId);
    const activeScreen = document.getElementById("active-screen");

    if (!activeArea) {
        activeScreen.style.display = "none";
        return;
    }
    activeScreen.style.display = "block";

    // 2. Intestazione dell'area attiva
    document.getElementById("active-area-name").textContent = activeArea.name;

    // 3. Disegna le task dell'area corrente
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    const emptyMsg = document.getElementById("empty-tasks-msg");
    emptyMsg.style.display = activeArea.tasks.length ? "none" : "block";

    activeArea.tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item ${task.done ? "completed" : ""}`;

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = task.done;
        cb.onchange = () => {
            task.done = cb.checked;
            save();
        };

        const span = document.createElement("span");
        span.className = "task-name";
        span.textContent = task.text;

        const timeBadge = document.createElement("span");
        timeBadge.className = "task-time-badge";
        timeBadge.textContent = task.time || "--:--";

        const prioBadge = document.createElement("span");
        prioBadge.className = `task-priority-badge prio-${task.priority}`;
        prioBadge.textContent = task.priority;

        const delBtn = document.createElement("button");
        delBtn.className = "task-del-btn";
        delBtn.textContent = "✕";
        delBtn.title = "Elimina";
        delBtn.onclick = () => {
            activeArea.tasks = activeArea.tasks.filter(t => t.id !== task.id);
            save();
        };

        li.append(cb, span, timeBadge, prioBadge, delBtn);
        taskList.appendChild(li);
    });
}

// Evento: Aggiungi nuova area/tab
document.getElementById("new-tab-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("new-tab-input");
    const name = input.value.trim().toUpperCase();
    if (!name) return;

    const newId = "area_" + Date.now();
    areas.push({ id: newId, name, tasks: [] });
    activeAreaId = newId;
    input.value = "";
    save();
});

// Evento: Elimina area corrente
document.getElementById("delete-area-btn").addEventListener("click", () => {
    const activeArea = areas.find(a => a.id === activeAreaId);
    if (!activeArea) return;
    if (confirm(`Eliminare l'area "${activeArea.name}" e tutti i suoi obiettivi?`)) {
        areas = areas.filter(a => a.id !== activeAreaId);
        activeAreaId = areas[0]?.id || null;
        save();
    }
});

// Evento: Aggiungi nuova task all'area corrente
document.getElementById("task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const activeArea = areas.find(a => a.id === activeAreaId);
    if (!activeArea) return;

    const textInput = document.getElementById("task-text");
    const timeInput = document.getElementById("task-time");
    const prioInput = document.getElementById("task-priority");

    const text = textInput.value.trim();
    if (!text) return;

    activeArea.tasks.push({
        id: "task_" + Date.now(),
        text,
        time: timeInput.value,
        priority: prioInput.value,
        done: false
    });

    textInput.value = "";
    timeInput.value = "";
    save();
});

//Regola l'ora e i reminder
const orarioScelto = document.getElementById("task-time").value;
// Il valore sarà sempre una stringa perfetta e pulita, es: "14:30"



render();
