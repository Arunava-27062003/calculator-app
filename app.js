const display = document.getElementById('display');
const modeToggleBtn = document.getElementById('mode-toggle');
const buttons = document.querySelectorAll('.btn');

let expression = '';
let isDegMode = true;

function updateDisplay() {
    display.value = expression === '' ? '0' : expression;
}

function factorial(n) {
    n = Math.round(n);
    if (n < 0) return NaN;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function sinFn(x) {
    return Math.sin(isDegMode ? (x * Math.PI) / 180 : x);
}

function cosFn(x) {
    return Math.cos(isDegMode ? (x * Math.PI) / 180 : x);
}

function tanFn(x) {
    return Math.tan(isDegMode ? (x * Math.PI) / 180 : x);
}

// Translate the calculator's display syntax into a JS expression that can be
// evaluated against a fixed, whitelisted set of names (no free access to globals).
function toEvalExpression(expr) {
    let out = expr;
    out = out.replace(/\^/g, '**');
    // Euler's constant 'e', but never touch exponential notation like 1e+21 or 1e-5
    out = out.replace(/(?<![0-9.])e(?![0-9+\-])/g, 'E');
    out = out.replace(/π/g, 'PI');
    out = out.replace(/log\(/g, 'log10(');
    out = out.replace(/√\(/g, 'sqrt(');
    out = out.replace(/(\d+(\.\d+)?)!/g, 'factorial($1)');
    return out;
}

function evaluateExpression(expr) {
    const jsExpr = toEvalExpression(expr);
    const evaluator = new Function(
        'sin', 'cos', 'tan', 'log10', 'ln', 'sqrt', 'factorial', 'PI', 'E',
        `"use strict"; return (${jsExpr});`
    );
    return evaluator(sinFn, cosFn, tanFn, Math.log10, Math.log, Math.sqrt, factorial, Math.PI, Math.E);
}

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        const { action, value } = button.dataset;

        if (action === 'toggle-mode') {
            isDegMode = !isDegMode;
            modeToggleBtn.textContent = isDegMode ? 'Deg' : 'Rad';
        } else if (action === 'clear') {
            expression = '';
        } else if (action === 'backspace') {
            expression = expression.slice(0, -1);
        } else if (action === 'percent') {
            if (expression !== '') {
                expression = String(parseFloat(expression) / 100);
            }
        } else if (action === 'equals') {
            if (expression !== '') {
                try {
                    let result = evaluateExpression(expression);
                    if (typeof result === 'number' && Number.isFinite(result)) {
                        result = parseFloat(result.toPrecision(12));
                        expression = String(result);
                    } else {
                        expression = 'Error';
                    }
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
    if (/[0-9+\-*/.%^()]/.test(e.key)) {
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
