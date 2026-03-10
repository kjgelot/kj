let modeActive = false;
const display = document.getElementById("display");

document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();
    if (key === "enter" || key === "=") {
        calculateResult();
    } else if (key === "backspace") {
        display.value = display.value.slice(0, -1);
    } else if (key === "escape" || key === "c") {
        clearDisplay();
    } else if (key === "%" || key.length === 1) { 
        appendToDisplay(key);
    }
});

function appendToDisplay(input) {
    display.value += input;
}

function clearDisplay() {
    display.value = "";
}


const getSecretMap = () => {
    return JSON.parse(atob("eyJrIjoiMSIsImUiOiIyIiwibiI6IjMiLCJyIjoiNCIsImMiOiI1IiwiaCI6IjYiLCJ0IjoiNyIsImEiOiI4IiwiZCI6IjkiLCJ1IjoiMCIsInYiOiIwIiwidyI6IjAiLCJ4IjoiMCIsInkiOiIwIiwieiI6IjAifQ=="));
};

function calculateResult() {
    let expression = display.value.toLowerCase();
    
    // Obfuscated check for "mahir"
    const codeKey = String.fromCharCode(109, 97, 104, 105, 114);

    if (expression === codeKey) {
        modeActive = true;
        display.value = "Unlocked!";
        setTimeout(() => clearDisplay(), 1000);
        return;
    }

    if (modeActive) {
        const map = getSecretMap();
        let decryptedExpression = "";
        for (let i = 0; i < expression.length; i++) {
            let char = expression[i];
            decryptedExpression += (map[char] !== undefined) ? map[char] : char;
        }
        expression = decryptedExpression;
    }

    try {
       
        expression = expression.replace(/%/g, '/100');
        
       
        expression = expression.replace(/sin\(/g, 'Math.sin(');
        expression = expression.replace(/cos\(/g, 'Math.cos(');
        expression = expression.replace(/tan\(/g, 'Math.tan(');
        expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
        expression = expression.replace(/\^/g, '**');

       
        if (!expression.includes('.') && /[0-9]/.test(expression) && !expression.includes('Math') && !expression.includes('/100')) {
            let bigIntExpr = expression.replace(/\d+/g, '$&n');
            let result = eval(bigIntExpr);
            display.value = result.toString().replace('n', '');
        } else {
            
            display.value = eval(expression);
        }
    } catch (error) {
        display.value = "Error";
    }
}