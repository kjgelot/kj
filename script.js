let modeActive = false;
const display = document.getElementById("display");
const liveResult = document.getElementById("live-result");
const hiddenInput = document.getElementById("hidden-keyboard");

function focusKeyboard() {
    hiddenInput.focus();
}

hiddenInput.addEventListener("input", function(e) {
    let char = e.target.value.slice(-1);
    if (char) {
        appendToDisplay(char.toLowerCase());
    }
    e.target.value = ""; 
});

document.addEventListener("keydown", function(event) {
    if (document.activeElement === hiddenInput) return; 
    const key = event.key.toLowerCase();
    
    if (key === "enter" || key === "=") {
        calculateResult();
    } else if (key === "backspace") {
        display.value = display.value.slice(0, -1);
        updateLive();
    } else if (key === "escape" || key === "c") {
        clearDisplay();
    } else if (key === "%" || key.length === 1) { 
        appendToDisplay(key);
    }
});

function appendToDisplay(input) {
    if (display.value === "Unlocked!" || display.value === "Error") {
        display.value = "";
    }
    display.value += input;
    updateLive();
}

function clearDisplay() {
    display.value = "";
    liveResult.innerText = "";
}

const getFwdMap = () => JSON.parse(atob("eyJrIjoiMSIsImUiOiIyIiwibiI6IjMiLCJyIjoiNCIsImMiOiI1IiwiaCI6IjYiLCJ0IjoiNyIsImEiOiI4IiwiZCI6IjkiLCJ1IjoiMCIsInYiOiIwIiwidyI6IjAiLCJ4IjoiMCIsInkiOiIwIiwieiI6IjAifQ=="));
const getRevMap = () => JSON.parse(atob("eyIxIjoiSyIsIjIiOiJFIiwiMyI6Ik4iLCI0IjoiUiIsIjUiOiJDIiwiNiI6IkgiLCI3IjoiVCIsIjgiOiJBIiwiOSI6IkQifQ=="));

function triggerError() {
    display.value = "Error";
    liveResult.innerText = "";
    setTimeout(() => {
        if (display.value === "Error") clearDisplay();
    }, 1000);
}

function updateLive() {
    let expr = display.value.toLowerCase();
    if (!expr) { 
        liveResult.innerText = ""; 
        return; 
    }

    const secretPass = atob("bWFoaXI="); // "mahir" encrypted

    // Unlock exactly when "mahir" is typed
    if (expr === secretPass) {
        modeActive = true;
        display.value = "Unlocked!";
        liveResult.innerText = "";
        setTimeout(() => clearDisplay(), 1000);
        return;
    }

    let pureChars = expr.replace(/[+\-*/.%()]/g, '');
    let hasNumbers = /[0-9]/.test(pureChars);
    let hasLetters = /[a-z]/i.test(pureChars);

    // Rule 1: Mix of numbers and letters = Error
    if (hasNumbers && hasLetters) {
        triggerError();
        return;
    }

    // Rule 2: Letters typed without password unlock = Error, UNLESS it's matching the password exactly
    if (hasLetters && !modeActive) {
        if (!secretPass.startsWith(expr)) {
            triggerError();
            return;
        }
    }

    let evalExpr = expr;
    let isLetterCalc = modeActive && hasLetters && !hasNumbers;

    if (isLetterCalc) {
        const map = getFwdMap();
        let dec = "";
        for (let i = 0; i < expr.length; i++) {
            dec += map[expr[i]] !== undefined ? map[expr[i]] : expr[i];
        }
        evalExpr = dec;
    }

    try {
        evalExpr = evalExpr.replace(/%/g, '/100');

        if (/[+\-*/.]$/.test(evalExpr)) {
            return; 
        }

        // Do not calculate if the user is just typing the password
        if (hasLetters && !modeActive) {
            return;
        }

        let res = eval(evalExpr);
        if (res !== undefined && !Number.isNaN(res) && res !== Infinity) {
            if (isLetterCalc) {
                let resStr = res.toString().toUpperCase();
                const revMap = getRevMap();
                let enc = "";
                const zeroChars = ['U', 'V', 'W', 'X', 'Y', 'Z'];
                
                for (let i = 0; i < resStr.length; i++) {
                    if (resStr[i] === '0') {
                        enc += zeroChars[Math.floor(Math.random() * zeroChars.length)];
                    } else {
                        enc += revMap[resStr[i]] !== undefined ? revMap[resStr[i]] : resStr[i];
                    }
                }
                liveResult.innerText = "= " + enc;
            } else {
                liveResult.innerText = "= " + res;
            }
        } else {
            liveResult.innerText = "";
        }
    } catch (error) {
        liveResult.innerText = ""; 
    }
}

function calculateResult() {
    if (liveResult.innerText) {
        display.value = liveResult.innerText.replace("= ", "");
        liveResult.innerText = "";
    }
}