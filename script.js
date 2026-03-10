let modeActive = false;
const display = document.getElementById("display");

// This allows the mobile keyboard to type directly and calculates when Enter is pressed
display.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        calculateResult();
    }
});

function appendToDisplay(input) {
    display.value += input;
}

function clearDisplay() {
    display.value = "";
}

// Secret input map (letters to numbers)
const getSecretMap = () => {
    return JSON.parse(atob("eyJrIjoiMSIsImUiOiIyIiwibiI6IjMiLCJyIjoiNCIsImMiOiI1IiwiaCI6IjYiLCJ0IjoiNyIsImEiOiI4IiwiZCI6IjkiLCJ1IjoiMCIsInYiOiIwIiwidyI6IjAiLCJ4IjoiMCIsInkiOiIwIiwieiI6IjAifQ=="));
};

// Secret output map (numbers back to letters)
const getReverseMap = () => {
    return JSON.parse(atob("eyIxIjoiSyIsIjIiOiJFIiwiMyI6Ik4iLCI0IjoiUiIsIjUiOiJDIiwiNiI6IkgiLCI3IjoiVCIsIjgiOiJBIiwiOSI6IkQiLCIwIjoiVSIsIi0iOiItIiwiLiI6Ii4ifQ=="));
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

        let finalResult = "";

        if (!expression.includes('.') && /[0-9]/.test(expression) && !expression.includes('Math') && !expression.includes('/100')) {
            let bigIntExpr = expression.replace(/\d+/g, '$&n');
            let result = eval(bigIntExpr);
            finalResult = result.toString().replace('n', '');
        } else {
            finalResult = eval(expression).toString();
        }

        // Convert the final number back into letters if unlocked
        if (modeActive) {
            const reverseMap = getReverseMap();
            let letterResult = "";
            for (let i = 0; i < finalResult.length; i++) {
                let char = finalResult[i];
                letterResult += (reverseMap[char] !== undefined) ? reverseMap[char] : char;
            }
            display.value = letterResult;
        } else {
            display.value = finalResult;
        }

    } catch (error) {
        display.value = "Error";
    }
}