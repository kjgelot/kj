let modeActive = false;
let secretHistory = [];
let isFullscreen = true;
const display = document.getElementById("display");
const liveResult = document.getElementById("live-result");
const hiddenInput = document.getElementById("hidden-keyboard");
const historyLog = document.getElementById("history-log");
const securityScreen = document.getElementById("security-screen");
const calcWindow = document.getElementById("calculator-window");
const modeBtn = document.getElementById("mode-btn");

// --- RESIZE & MODE LOGIC ---
function toggleMode() {
    isFullscreen = !isFullscreen;
    if (isFullscreen) {
        calcWindow.classList.add("fullscreen");
        calcWindow.classList.remove("windowed");
        modeBtn.innerText = "🗗 Win";
    } else {
        calcWindow.classList.remove("fullscreen");
        calcWindow.classList.add("windowed");
        modeBtn.innerText = "🖵 Full";
        // Reset transform to rely on absolute positioning correctly
        calcWindow.style.transform = "none";
        calcWindow.style.left = "10px"; // Default position when windowed
        calcWindow.style.top = "10px";
    }
}

function adjustSize(dimension, amount) {
    if (isFullscreen) return; // Cannot resize in fullscreen
    let currentRect = calcWindow.getBoundingClientRect();
    if (dimension === 'w') {
        let newWidth = currentRect.width + amount;
        if (newWidth > 250) calcWindow.style.width = newWidth + "px"; // Minimum width 250px
    } else if (dimension === 'h') {
        let newHeight = currentRect.height + amount;
        if (newHeight > 350) calcWindow.style.height = newHeight + "px"; // Minimum height 350px
    }
}

// --- DRAG LOGIC ---
const dragHandle = document.getElementById("drag-handle");
let isDragging = false, startX, startY, initialX, initialY;

function dragStart(e) {
    if (isFullscreen) return; // Cannot drag in fullscreen
    isDragging = true;
    let event = e.type.includes('mouse') ? e : e.touches[0];
    startX = event.clientX;
    startY = event.clientY;
    let rect = calcWindow.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
}

function dragMove(e) {
    if (!isDragging || isFullscreen) return;
    e.preventDefault(); 
    let event = e.type.includes('mouse') ? e : e.touches[0];
    let dx = event.clientX - startX;
    let dy = event.clientY - startY;
    calcWindow.style.left = (initialX + dx) + "px";
    calcWindow.style.top = (initialY + dy) + "px";
}

function dragEnd() { isDragging = false; }

dragHandle.addEventListener("mousedown", dragStart);
dragHandle.addEventListener("touchstart", dragStart, {passive: false});
document.addEventListener("mousemove", dragMove);
document.addEventListener("touchmove", dragMove, {passive: false});
document.addEventListener("mouseup", dragEnd);
document.addEventListener("touchend", dragEnd);

// --- SECURITY & CORE LOGIC ---
setInterval(function() {
    let before = new Date().getTime();
    debugger;
    let after = new Date().getTime();
    if (after - before > 100) {
        securityScreen.style.display = "flex"; 
        document.body.style.overflow = "hidden";
    }
}, 2000);

function focusKeyboard() { hiddenInput.focus(); }

hiddenInput.addEventListener("input", function(e) {
    let char = e.target.value.slice(-1);
    if (char) appendToDisplay(char.toLowerCase());
    e.target.value = ""; 
});

document.addEventListener("keydown", function(event) {
    if (document.activeElement === hiddenInput) return; 
    const key = event.key.toLowerCase();
    
    if (key === "enter" || key === "=") calculateResult();
    else if (key === "backspace") { display.value = display.value.slice(0, -1); updateLive(); }
    else if (key === "escape") handleClearPress();
    else if (key === "%" || key.length === 1) appendToDisplay(key);
});

let clickCount = 0;
document.getElementById("clear-btn").addEventListener("click", handleClearPress);

function handleClearPress() {
    clickCount++;
    if (clickCount === 1) {
        setTimeout(() => {
            if (clickCount === 1) {
                display.value = ""; liveResult.innerText = "";
            } else {
                display.value = ""; liveResult.innerText = "";
                modeActive = false; secretHistory = [];
                historyLog.style.display = "none"; historyLog.innerHTML = "";
            }
            clickCount = 0;
        }, 300);
    }
}

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
function cancelPress() { clearTimeout(pressTimer); }
function endPress(e) {
    if (e.cancelable) e.preventDefault();
    clearTimeout(pressTimer);
    if (historyLog.style.display !== "flex") calculateResult();
}

function updateHistoryView() {
    historyLog.innerHTML = "<h3 style='margin-top:0;'>System Logs</h3>";
    secretHistory.forEach(entry => { historyLog.innerHTML += `<div class='history-entry'>${entry}</div>`; });
    let closeBtn = document.createElement("button");
    closeBtn.innerText = "Close Logs";
    closeBtn.onclick = () => historyLog.style.display = "none";
    historyLog.appendChild(closeBtn);
}

function appendToDisplay(input) {
    if (display.value === "Unlocked!" || display.value === "Error") display.value = "";
    display.value += input;
    updateLive();
}

function triggerError() {
    display.value = "Error"; liveResult.innerText = "";
    setTimeout(() => { if (display.value === "Error") { display.value = ""; liveResult.innerText = ""; } }, 1000);
}

const sysLayoutCfg = [107, 101, 110, 114, 99, 104, 116, 97, 100]; 
const authDataCfg = [109, 97, 104, 105, 114];

function updateLive() {
    let expr = display.value.toLowerCase();
    if (!expr) { liveResult.innerText = ""; return; }

    const authCheck = String.fromCharCode(...authDataCfg);

    if (expr === authCheck) {
        modeActive = true; display.value = "Unlocked!"; liveResult.innerText = "";
        setTimeout(() => { if(display.value === "Unlocked!") display.value = ""; }, 1000);
        return;
    }

    let pureChars = expr.replace(/[+\-*/.%()]/g, '');
    let hasNumbers = /[0-9]/.test(pureChars);
    let hasLetters = /[a-z]/i.test(pureChars);

    if (hasNumbers && hasLetters) { triggerError(); return; }
    if (hasLetters && !modeActive) {
        if (!authCheck.startsWith(expr)) { triggerError(); return; }
    }

    let evalExpr = expr;
    let isLetterCalc = modeActive && hasLetters && !hasNumbers;

    if (isLetterCalc) {
        let dec = "";
        for (let i = 0; i < expr.length; i++) {
            let charCode = expr.charCodeAt(i);
            let mapIndex = sysLayoutCfg.indexOf(charCode);
            if (mapIndex !== -1) {
                dec += (mapIndex + 1).toString();
            } else if (charCode >= 117 && charCode <= 122) { 
                dec += "0";
            } else {
                dec += expr[i];
            }
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
                let resStr = res.toString();
                let enc = "";
                for (let i = 0; i < resStr.length; i++) {
                    let char = resStr[i];
                    if (char === '0') {
                        enc += String.fromCharCode(Math.floor(Math.random() * 6) + 117).toUpperCase();
                    } else if (char >= '1' && char <= '9') {
                        enc += String.fromCharCode(sysLayoutCfg[parseInt(char) - 1]).toUpperCase();
                    } else {
                        enc += char;
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
        if (modeActive && equation !== "Unlocked!") secretHistory.push(`${equation.toUpperCase()} = ${answer}`);
        display.value = answer;
        liveResult.innerText = "";
    }
}