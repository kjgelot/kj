let modeActive = false;
let secretHistory = [];
const display = document.getElementById("display");
const liveResult = document.getElementById("live-result");
const hiddenInput = document.getElementById("hidden-keyboard");
const historyLog = document.getElementById("history-log");
const securityScreen = document.getElementById("security-screen");

setInterval(function() {
    let before = new Date().getTime();
    debugger;
    let after = new Date().getTime();
    if (after - before > 100) {
        securityScreen.style.display = "flex"; 
        document.body.style.overflow = "hidden";
    }
}, 2000);

function focusKeyboard() {
    hiddenInput.focus();
}

hiddenInput.addEventListener("input", function(e) {
    let char = e.target.value.slice(-1);
    if (char) appendToDisplay(char.toLowerCase());
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
    } else if (key === "escape") { // FIXED: Removed the 'c' shortcut here
        handleClearPress();
    } else if (key === "%" || key.length === 1) { 
        appendToDisplay(key);
    }
});

// Panic Button Logic (Double tap C)
let clickCount = 0;
const clearBtn = document.getElementById("clear-btn");
clearBtn.addEventListener("click", handleClearPress);

function handleClearPress() {
    clickCount++;
    if (clickCount === 1) {
        setTimeout(() => {
            if (clickCount === 1) {
                // Single tap: normal clear
                display.value = "";
                liveResult.innerText = "";
            } else {
                // Double tap: Panic mode! Lock everything instantly
                display.value = "";
                liveResult.innerText = "";
                modeActive = false;
                secretHistory = [];
                historyLog.style.display = "none";
                historyLog.innerHTML = "";
            }
            clickCount = 0;
        }, 300);
    }
}

// Long Press Equals for History
let pressTimer;
const eqBtn = document.getElementById("equal-btn");

eqBtn.addEventListener('mousedown', startPress);
eqBtn.addEventListener('touchstart', startPress);
eqBtn.addEventListener('mouseup', endPress);
eqBtn.addEventListener('mouseleave', cancelPress);
eqBtn.addEventListener('touchend', endPress);

function startPress(e) {
    if (e.cancelable) e.preventDefault();
    pressTimer = window.setTimeout(() => {
        if (modeActive) {
            historyLog.style.display = historyLog.style.display === "flex" ? "none" : "flex";
            updateHistoryView();
        }
    }, 1000); 
}

function cancelPress() {
    clearTimeout(pressTimer);
}

function endPress(e) {
    if (e.cancelable) e.preventDefault();
    clearTimeout(pressTimer);
    if (historyLog.style.display !== "flex") {
        calculateResult();
    }
}

function updateHistoryView() {
    historyLog.innerHTML = "<h3 style='margin-top:0;'>Secret History</h3>";
    secretHistory.forEach(entry => {
        historyLog.innerHTML += `<div class='history-entry'>${entry}</div>`;
    });
    let closeBtn = document.createElement("button");
    closeBtn.innerText = "Close History";
    closeBtn.onclick = () => historyLog.style.display = "none";
    historyLog.appendChild(closeBtn);
}

function appendToDisplay(input) {
    if (display.value === "Unlocked!" || display.value === "Error") {
        display.value = "";
    }
    display.value += input;
    updateLive();
}

const getFwdMap = () => JSON.parse(atob("eyJrIjoiMSIsImUiOiIyIiwibiI6IjMiLCJyIjoiNCIsImMiOiI1IiwiaCI6IjYiLCJ0IjoiNyIsImEiOiI4IiwiZCI6IjkiLCJ1IjoiMCIsInYiOiIwIiwidyI6IjAiLCJ4IjoiMCIsInkiOiIwIiwieiI6IjAifQ=="));
const getRevMap = () => JSON.parse(atob("eyIxIjoiSyIsIjIiOiJFIiwiMyI6Ik4iLCI0IjoiUiIsIjUiOiJDIiwiNiI6IkgiLCI3IjoiVCIsIjgiOiJBIiwiOSI6IkQifQ=="));

function triggerError() {
    display.value = "Error";
    liveResult.innerText = "";
    setTimeout(() => {
        if (display.value === "Error") {
            display.value = "";
            liveResult.innerText = "";
        }
    }, 1000);
}

function updateLive() {
    let expr = display.value.toLowerCase();
    if (!expr) { liveResult.innerText = ""; return; }

    const secretPass = atob("bWFoaXI=");

    if (expr === secretPass) {
        modeActive = true;
        display.value = "Unlocked!";
        liveResult.innerText = "";
        setTimeout(() => { if(display.value === "Unlocked!") display.value = ""; }, 1000);
        return;
    }

    let pureChars = expr.replace(/[+\-*/.%()]/g, '');
    let hasNumbers = /[0-9]/.test(pureChars);
    let hasLetters = /[a-z]/i.test(pureChars);

    if (hasNumbers && hasLetters) { triggerError(); return; }
    if (hasLetters && !modeActive) {
        if (!secretPass.startsWith(expr)) { triggerError(); return; }
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
        if (/[+\-*/.]$/.test(evalExpr)) return; 
        if (hasLetters && !modeActive) return;

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
        const equation = display.value;
        const answer = liveResult.innerText.replace("= ", "");
        
        // Save to secret history if unlocked
        if (modeActive && equation !== "Unlocked!") {
            secretHistory.push(`${equation.toUpperCase()} = ${answer}`);
        }

        display.value = answer;
        liveResult.innerText = "";
    }
}