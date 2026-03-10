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

// Encrypted maps
const getFwdMap = () => JSON.parse(atob("eyJrIjoiMSIsImUiOiIyIiwibiI6IjMiLCJyIjoiNCIsImMiOiI1IiwiaCI6IjYiLCJ0IjoiNyIsImEiOiI4IiwiZCI6IjkiLCJ1IjoiMCIsInYiOiIwIiwidyI6IjAiLCJ4IjoiMCIsInkiOiIwIiwieiI6IjAifQ=="));
const getRevMap = () => JSON.parse(atob("eyIxIjoiSyIsIjIiOiJFIiwiMyI6Ik4iLCI0IjoiUiIsIjUiOiJDIiwiNiI6IkgiLCI3IjoiVCIsIjgiOiJBIiwiOSI6IkQifQ=="));

function updateLive() {
    let expr = display.value.toLowerCase();
    if (!expr) { 
        liveResult.innerText = ""; 
        return; 
    }

    // Checking "mahir" securely
    if (expr === atob("bWFoaXI=")) {
        modeActive = true;
        display.value = "Unlocked!";
        liveResult.innerText = "";
        setTimeout(() => clearDisplay(), 1000);
        return;
    }

    if (modeActive) {
        const map = getFwdMap();
        let dec = "";
        for (let i = 0; i < expr.length; i++) {
            dec += map[expr[i]] !== undefined ? map[expr[i]] : expr[i];
        }
        expr = dec;
    }

    try {
        expr = expr.replace(/%/g, '/100');

        if (/[+\-*/.]$/.test(expr)) {
            return; 
        }

        let res = eval(expr);
        if (res !== undefined && !Number.isNaN(res) && res !== Infinity) {
            if (modeActive) {
                let resStr = res.toString().toUpperCase();
                const revMap = getRevMap();
                let enc = "";
                const zeroChars = ['U', 'V', 'W', 'X', 'Y', 'Z'];
                
                for (let i = 0; i < resStr.length; i++) {
                    if (resStr[i] === '0') {
                        // Ahin 0 mate randomly U, V, W, X, Y, Z mathi aek pasand thase
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