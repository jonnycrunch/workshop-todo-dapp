import uuidv4 from 'uuid/v4';
import throttle from 'lodash/throttle';

let todos;
const subscribers = new Set();

window.addEventListener('unload', () => saveTodos(todos));

const readTodos = () => JSON.parse(localStorage.getItem('dapp-todos') || []);
const saveTodos = () => localStorage.setItem('dapp-todos', JSON.stringify(todos));
const saveTodosThrottled = throttle(saveTodos, 1000, { leading: false });

const publishStateChange = () => {
    saveTodosThrottled(todos);
    subscribers.forEach((listener) => listener(todos));
};

export default {
    load() {
        return new Promise((resolve) => {
            todos = readTodos();

            setTimeout(() => resolve(todos), 400);
        });
    },

    add(title) {
        todos = [
            ...todos,
            { id: uuidv4(), title, completed: false },
        ];

        publishStateChange();
    },

    remove(id) {
        const index = todos.findIndex((todo) => todo.id === id);

        if (index === -1) {
            return;
        }

        todos = [
            ...todos.slice(0, index),
            ...todos.slice(index + 1),
        ];

        publishStateChange();
    },

    updateTitle(id, title) {
        const index = todos.findIndex((todo) => todo.id === id);

        if (index === -1) {
            return;
        }

        const todo = todos[index];

        if (todo.title === title) {
            return;
        }

        const newTodo = { ...todo, title };

        todos = [
            ...todos.slice(0, index),
            newTodo,
            ...todos.slice(index + 1),
        ];

        publishStateChange();
    },

    updateCompleted(id, completed) {
        const index = todos.findIndex((todo) => todo.id === id);

        if (index === -1) {
            return;
        }

        const todo = todos[index];

        if (todo.completed === completed) {
            return;
        }

        const newTodo = { ...todo, completed };

        todos = [
            ...todos.slice(0, index),
            newTodo,
            ...todos.slice(index + 1),
        ];

        publishStateChange();
    },

    updateAllCompleted(completed) {
        todos.forEach((todo) => this.updateCompleted(todo.id, completed));
    },

    clearCompleted() {
        todos
        .filter((todo) => todo.completed)
        .reverse()
        .forEach((todo) => this.remove(todo.id));
    },

    subscribe(subscriber) {
        subscribers.add(subscriber);

        return () => subscribers.remove(subscriber);
    },
};