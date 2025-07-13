// Todo App Class
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('nova-todo-tasks')) || [];
        this.currentFilter = 'all';
        this.currentTheme = localStorage.getItem('nova-todo-theme') || 'light';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.renderTasks();
        this.updateStats();
        this.setupBottomMenu();
    }

    setupEventListeners() {
        // Add task functionality
        const taskInput = document.getElementById('taskInput');
        const addTaskBtn = document.getElementById('addTaskBtn');

        addTaskBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.setFilter(tab.dataset.filter);
            });
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        if (!taskText) {
            this.showToast('Please enter a task', 'warning');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        taskInput.value = '';
        this.showToast('Task added successfully!', 'success');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as active';
            this.showToast(message, 'success');
        }
    }

    deleteTask(id) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            const deletedTask = this.tasks[taskIndex];
            this.tasks.splice(taskIndex, 1);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            this.showToast('Task deleted', 'success');
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveTasks();
            this.renderTasks();
            this.showToast('Task updated!', 'success');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const tasksContainer = document.getElementById('tasksContainer');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tasksContainer.innerHTML = '';

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            tasksContainer.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.dataset.taskId = task.id;

        taskDiv.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="todoApp.toggleTask(${task.id})">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="task-text">${this.escapeHtml(task.text)}</div>
            <div class="task-actions">
                <button class="task-action-btn edit" onclick="todoApp.editTask(${task.id})" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete" onclick="todoApp.deleteTask(${task.id})" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return taskDiv;
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const activeTasks = totalTasks - completedTasks;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('activeTasks').textContent = activeTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('nova-todo-theme', this.currentTheme);
        this.applyTheme();
        
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            this.showToast('Dark theme enabled', 'success');
        } else {
            icon.className = 'fas fa-moon';
            this.showToast('Light theme enabled', 'success');
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    setupBottomMenu() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all items
                menuItems.forEach(mi => mi.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');
                
                const section = item.dataset.section;
                this.handleMenuNavigation(section);
            });
        });
    }

    handleMenuNavigation(section) {
        switch (section) {
            case 'tasks':
                this.showToast('Tasks view', 'success');
                break;
            case 'add':
                document.getElementById('taskInput').focus();
                this.showToast('Add new task', 'success');
                break;
            case 'stats':
                this.showToast('Viewing statistics', 'success');
                break;
            case 'settings':
                this.showToast('Settings (coming soon)', 'warning');
                break;
        }
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        toast.innerHTML = `
            <i class="toast-icon ${icons[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('fade-out');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    saveTasks() {
        localStorage.setItem('nova-todo-tasks', JSON.stringify(this.tasks));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility methods
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        if (completedCount > 0) {
            this.showToast(`${completedCount} completed task(s) cleared`, 'success');
        }
    }

    clearAllTasks() {
        if (this.tasks.length === 0) {
            this.showToast('No tasks to clear', 'warning');
            return;
        }

        if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
            const taskCount = this.tasks.length;
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showToast(`${taskCount} task(s) cleared`, 'success');
        }
    }

    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `nova-todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Tasks exported successfully!', 'success');
    }

    importTasks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedTasks = JSON.parse(event.target.result);
                    if (Array.isArray(importedTasks)) {
                        this.tasks = importedTasks;
                        this.saveTasks();
                        this.renderTasks();
                        this.updateStats();
                        this.showToast('Tasks imported successfully!', 'success');
                    } else {
                        throw new Error('Invalid file format');
                    }
                } catch (error) {
                    this.showToast('Error importing tasks. Please check the file format.', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        todoApp.addTask();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        const taskInput = document.getElementById('taskInput');
        if (document.activeElement === taskInput) {
            taskInput.value = '';
            taskInput.blur();
        }
    }
});

// Initialize the app
const todoApp = new TodoApp();

// Add some sample tasks on first load
if (todoApp.tasks.length === 0) {
    const sampleTasks = [
        { id: Date.now() - 3, text: 'Welcome to Nova Todo! 🚀', completed: false, createdAt: new Date().toISOString() },
        { id: Date.now() - 2, text: 'Click the checkbox to mark tasks as complete', completed: false, createdAt: new Date().toISOString() },
        { id: Date.now() - 1, text: 'Use the bottom menu to navigate between sections', completed: false, createdAt: new Date().toISOString() }
    ];
    
    todoApp.tasks = sampleTasks;
    todoApp.saveTasks();
    todoApp.renderTasks();
    todoApp.updateStats();
}

// Service Worker for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 