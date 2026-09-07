const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let expression = '';

function updateDisplay() {
    display.value = expression === '' ? '0' : expression;
}

function sanitizeForEval(expr) {
    return /^[0-9+\-*/.%\s]+$/.test(expr);
}

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        const { action, value } = button.dataset;

        if (action === 'clear') {
            expression = '';
        } else if (action === 'backspace') {
            expression = expression.slice(0, -1);
        } else if (action === 'percent') {
            if (expression !== '') {
                expression = String(parseFloat(expression) / 100);
            }
        } else if (action === 'equals') {
            if (expression !== '' && sanitizeForEval(expression)) {
                try {
                    const result = Function(`"use strict"; return (${expression})`)();
                    expression = Number.isFinite(result) ? String(result) : 'Error';
                } catch {
                    expression = 'Error';
                }
            }
        } else if (value !== undefined) {
            expression += value;
        }

        updateDisplay();
    });
});

document.addEventListener('keydown', (e) => {
    if (/[0-9+\-*/.%]/.test(e.key)) {
        expression += e.key;
        updateDisplay();
    } else if (e.key === 'Enter' || e.key === '=') {
        document.querySelector('[data-action="equals"]').click();
    } else if (e.key === 'Backspace') {
        expression = expression.slice(0, -1);
        updateDisplay();
    } else if (e.key === 'Escape') {
        expression = '';
        updateDisplay();
    }
});

updateDisplay();
