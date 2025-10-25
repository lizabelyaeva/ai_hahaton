// Pixel Quest - JavaScript Logic

class PixelQuest {
    constructor() {
        this.data = this.loadData();
        this.currentWeek = 0;
        this.selectedDate = new Date(); // Добавляем выбранную дату
        this.avatars = ['🧙‍♂️', '🛡️', '🏹', '⚔️'];
        this.moods = {
            happy: '😊',
            neutral: '😐',
            sad: '😞'
        };
        
        this.init();
    }

    // Инициализация приложения
    init() {
        this.setupEventListeners();
        this.renderMap();
        this.renderControlPanel();
        this.updateStats();
    }

    // Загрузка данных из localStorage
    loadData() {
        const defaultData = {
            user: {
                name: 'Игрок',
                avatarId: 1
            },
            days: {}
        };
        
        const saved = localStorage.getItem('pixelQuestData');
        return saved ? JSON.parse(saved) : defaultData;
    }

    // Сохранение данных в localStorage
    saveData() {
        localStorage.setItem('pixelQuestData', JSON.stringify(this.data));
    }

    // Получение данных дня
    getDayData(date) {
        const dateStr = this.formatDate(date);
        if (!this.data.days[dateStr]) {
            this.data.days[dateStr] = {
                mood: null,
                tasks: []
            };
        }
        return this.data.days[dateStr];
    }

    // Форматирование даты
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Получение текущей даты
    getToday() {
        return new Date();
    }

    // Получение дат недели
    getWeekDates(weekOffset = 0) {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
        
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    }

    // Определение типа тайла на основе продуктивности
    getTileType(dayData) {
        if (!dayData.mood || dayData.tasks.length === 0) {
            return 'empty';
        }

        const completedTasks = dayData.tasks.filter(task => task.completed).length;
        const totalTasks = dayData.tasks.length;
        const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

        if (dayData.mood === 'happy' && completionRate === 1) {
            return 'excellent';
        } else if (dayData.mood === 'happy' && completionRate >= 0.5) {
            return 'good';
        } else if (dayData.mood === 'neutral' && completionRate >= 0.5) {
            return 'average';
        } else {
            return 'poor';
        }
    }

    // Рендеринг карты
    renderMap() {
        const mapContainer = document.getElementById('pixelMap');
        const weekDates = this.getWeekDates(this.currentWeek);
        const today = this.getToday();
        
        mapContainer.innerHTML = '';
        
        weekDates.forEach((date, index) => {
            const dayData = this.getDayData(date);
            const tileType = this.getTileType(dayData);
            const isToday = this.formatDate(date) === this.formatDate(today);
            const isSelected = this.formatDate(date) === this.formatDate(this.selectedDate);
            
            const tile = document.createElement('div');
            tile.className = `day-tile ${tileType} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
            tile.dataset.date = this.formatDate(date);
            
            // Добавление аватара на сегодняшний день
            if (isToday) {
                const avatar = document.createElement('div');
                avatar.className = 'avatar';
                avatar.textContent = this.avatars[this.data.user.avatarId - 1];
                tile.appendChild(avatar);
            }
            
            // Добавление декораций для отличных дней
            if (tileType === 'excellent') {
                const decorations = ['flower', 'chest', 'butterfly'];
                const decoration = decorations[Math.floor(Math.random() * decorations.length)];
                const decorationEl = document.createElement('div');
                decorationEl.className = `tile-decoration ${decoration}`;
                decorationEl.textContent = this.getDecorationEmoji(decoration);
                tile.appendChild(decorationEl);
            }
            
            // Добавление номера дня
            const dayNumber = document.createElement('div');
            dayNumber.textContent = date.getDate();
            dayNumber.style.position = 'absolute';
            dayNumber.style.bottom = '4px';
            dayNumber.style.right = '4px';
            dayNumber.style.fontSize = 'clamp(8px, 2vw, 20px)';
            dayNumber.style.color = 'white';
            dayNumber.style.textShadow = '1px 1px 0 black';
            dayNumber.style.fontWeight = 'bold';
            tile.appendChild(dayNumber);
            
            // Обработчик клика для выбора дня
            tile.addEventListener('click', () => {
                this.selectDate(date);
            });
            
            mapContainer.appendChild(tile);
        });
        
        // Обновление информации о текущей неделе
        const currentDateEl = document.getElementById('currentDate');
        const startDate = weekDates[0];
        const endDate = weekDates[6];
        currentDateEl.textContent = `${startDate.getDate()}.${startDate.getMonth() + 1} - ${endDate.getDate()}.${endDate.getMonth() + 1}`;
    }

    // Выбор даты
    selectDate(date) {
        this.selectedDate = new Date(date);
        this.renderMap();
        this.renderControlPanel();
        this.updateStats();
    }

    // Получение эмодзи для декораций
    getDecorationEmoji(type) {
        const decorations = {
            flower: '🌸',
            chest: '💰',
            butterfly: '🦋'
        };
        return decorations[type] || '✨';
    }

    // Рендеринг панели управления
    renderControlPanel() {
        const selectedDateEl = document.getElementById('todayDate');
        selectedDateEl.textContent = `${this.selectedDate.getDate()}.${this.selectedDate.getMonth() + 1}.${this.selectedDate.getFullYear()}`;
        
        const dayData = this.getDayData(this.selectedDate);
        
        // Установка настроения
        this.setMoodButtons(dayData.mood);
        
        // Рендеринг задач
        this.renderTasks(dayData.tasks);
    }

    // Установка активной кнопки настроения
    setMoodButtons(selectedMood) {
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mood === selectedMood) {
                btn.classList.add('active');
            }
        });
    }

    // Рендеринг списка задач
    renderTasks(tasks) {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
        
        tasks.forEach((task, index) => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            taskEl.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
                <span class="task-text">${task.text}</span>
                <button class="task-delete" data-index="${index}">×</button>
            `;
            
            tasksList.appendChild(taskEl);
        });
    }

    // Обновление статистики
    updateStats() {
        const dayData = this.getDayData(this.selectedDate);
        
        const completedTasks = dayData.tasks.filter(task => task.completed).length;
        const totalTasks = dayData.tasks.length;
        const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('productivity').textContent = `${productivity}%`;
    }

    // Показ модального окна дня
    showDayModal(date) {
        const modal = document.getElementById('dayModal');
        const dayData = this.getDayData(date);
        
        document.getElementById('modalDate').textContent = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
        
        const moodEl = document.getElementById('modalMood');
        if (dayData.mood) {
            moodEl.textContent = this.moods[dayData.mood];
        } else {
            moodEl.textContent = 'Не выбрано';
        }
        
        const tasksEl = document.getElementById('modalTasks');
        if (dayData.tasks.length > 0) {
            tasksEl.innerHTML = dayData.tasks.map(task => 
                `<div class="task-item ${task.completed ? 'completed' : ''}">
                    <span>${task.completed ? '✅' : '⭕'}</span>
                    <span>${task.text}</span>
                </div>`
            ).join('');
        } else {
            tasksEl.innerHTML = '<div>Задач нет</div>';
        }
        
        modal.style.display = 'block';
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Навигация по неделям
        document.getElementById('prevWeek').addEventListener('click', () => {
            this.currentWeek--;
            this.renderMap();
        });
        
        document.getElementById('nextWeek').addEventListener('click', () => {
            this.currentWeek++;
            this.renderMap();
        });
        
        // Выбор аватара
        document.querySelectorAll('.avatar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.data.user.avatarId = parseInt(btn.dataset.avatar);
                this.saveData();
                this.renderMap();
            });
        });
        
        // Выбор настроения
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const dayData = this.getDayData(this.selectedDate);
                dayData.mood = btn.dataset.mood;
                this.saveData();
                this.setMoodButtons(dayData.mood);
                this.renderMap();
            });
        });
        
        // Добавление задачи
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.addTask();
        });
        
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Обработка задач (через делегирование событий)
        document.getElementById('tasksList').addEventListener('click', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTask(parseInt(e.target.dataset.index));
            } else if (e.target.classList.contains('task-delete')) {
                this.deleteTask(parseInt(e.target.dataset.index));
            }
        });
        
        // Закрытие модального окна
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('dayModal').style.display = 'none';
        });
        
        document.getElementById('dayModal').addEventListener('click', (e) => {
            if (e.target.id === 'dayModal') {
                document.getElementById('dayModal').style.display = 'none';
            }
        });
    }

    // Добавление задачи
    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        
        if (text) {
            const dayData = this.getDayData(this.selectedDate);
            
            const newTask = {
                id: Date.now(),
                text: text,
                completed: false
            };
            
            dayData.tasks.push(newTask);
            this.saveData();
            this.renderTasks(dayData.tasks);
            this.updateStats();
            this.renderMap();
            
            input.value = '';
        }
    }

    // Переключение статуса задачи
    toggleTask(index) {
        const dayData = this.getDayData(this.selectedDate);
        
        if (dayData.tasks[index]) {
            dayData.tasks[index].completed = !dayData.tasks[index].completed;
            this.saveData();
            this.renderTasks(dayData.tasks);
            this.updateStats();
            this.renderMap();
        }
    }

    // Удаление задачи
    deleteTask(index) {
        const dayData = this.getDayData(this.selectedDate);
        
        if (dayData.tasks[index]) {
            dayData.tasks.splice(index, 1);
            this.saveData();
            this.renderTasks(dayData.tasks);
            this.updateStats();
            this.renderMap();
        }
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new PixelQuest();
});
