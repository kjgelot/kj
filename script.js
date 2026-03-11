let modeActive = false;
let secretHistory = [];
let isFullscreen = true;
let labelsRevealed = false;
const display = document.getElementById("display");
const liveResult = document.getElementById("live-result");
const hiddenInput = document.getElementById("hidden-keyboard");
const historyLog = document.getElementById("history-log");
const securityScreen = document.getElementById("security-screen");
const calcWindow = document.getElementById("calculator-window");
const modeBtn = document.getElementById("mode-btn");

const sysLayoutCfg = [107, 101, 110, 114, 99, 104, 116, 97, 100]; 
const authDataCfg = [109, 97, 104, 105, 114]; 
const uiDataCfg = [75, 64, 76, 112, 101, 115, 104, 56, 52]; 

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
        calcWindow.style.transform = "none";
        calcWindow.style.left = "10px";
        calcWindow.style.top = "10px";
    }
}

function adjustSize(dimension, amount) {
    if (isFullscreen) return;
    let currentRect = calcWindow.getBoundingClientRect();
    if (dimension === 'w') {
        let newWidth = currentRect.width + amount;
        if (newWidth > 250) calcWindow.style.width = newWidth + "px"; 
    } else if (dimension === 'h') {
        let newHeight = currentRect.height + amount;
        if (newHeight > 350) calcWindow.style.height = newHeight + "px"; 
    }
}

const dragHandle = document.getElementById("drag-handle");
let isDragging = false, startX, startY, initialX, initialY;

function dragStart(e) {
    if (isFullscreen) return; 
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
    
    let newY = initialY + dy;
    if (newY < 10) newY = 10; 

    calcWindow.style.left = (initialX + dx) + "px";
    calcWindow.style.top = newY + "px";
}

function dragEnd() { isDragging = false; }

dragHandle.addEventListener("mousedown", dragStart);
dragHandle.addEventListener("touchstart", dragStart, {passive: false});
document.addEventListener("mousemove", dragMove);
document.addEventListener("touchmove", dragMove, {passive: false});
document.addEventListener("mouseup", dragEnd);
document.addEventListener("touchend", dragEnd);

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
    if (!labelsRevealed) {
        hiddenInput.focus(); 
    } else {
        hiddenInput.blur();
    }
}

hiddenInput.addEventListener("input", function(e) {
    let char = e.target.value.slice(-1);
    if (char) appendToDisplay(char); 
    e.target.value = ""; 
});

document.addEventListener("keydown", function(event) {
    if (document.activeElement === hiddenInput) return; 
    const key = event.key;
    
    if (key === "Enter" || key === "=") calculateResult();
    else if (key === "Backspace") deleteLastChar(); 
    else if (key === "Escape") handleClearPress();
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
                if (labelsRevealed) toggleButtonLabels();
            }
            clickCount = 0;
        }, 300);
    }
}

// Backspace Function
function deleteLastChar() {
    if (display.value === "Unlocked!" || display.value === "Error" || display.value === "UI Updated!") {
        display.value = "";
    } else {
        display.value = display.value.slice(0, -1);
    }
    updateLive();
}

let plusTimer;
let plusLongPressed = false;
const plusBtn = document.getElementById("plus-btn");
plusBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    plusLongPressed = false;
    plusTimer = setTimeout(() => {
        plusLongPressed = true;
        if (document.activeElement === hiddenInput) hiddenInput.blur();
        else hiddenInput.focus();
    }, 800);
});
plusBtn.addEventListener('pointerup', (e) => {
    e.preventDefault();
    clearTimeout(plusTimer);
    if (!plusLongPressed) appendToDisplay('+');
});
plusBtn.addEventListener('pointerleave', () => clearTimeout(plusTimer));

let eqTimer;
let eqLongPressed = false;
const eqBtn = document.getElementById("equal-btn");
eqBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    eqLongPressed = false;
    eqTimer = setTimeout(() => {
        eqLongPressed = true;
        if (modeActive) {
            historyLog.style.display = historyLog.style.display === "flex" ? "none" : "flex";
            updateHistoryView();
        }
    }, 1000);
});
eqBtn.addEventListener('pointerup', (e) => {
    e.preventDefault();
    clearTimeout(eqTimer);
    if (!eqLongPressed && historyLog.style.display !== "flex") calculateResult();
});
eqBtn.addEventListener('pointerleave', () => clearTimeout(eqTimer));

function updateHistoryView() {
    historyLog.innerHTML = "<h3 style='margin-top:0;'>System Logs</h3>";
    secretHistory.forEach(entry => { historyLog.innerHTML += `<div class='history-entry'>${entry}</div>`; });
    let closeBtn = document.createElement("button");
    closeBtn.innerText = "Close Logs";
    closeBtn.onclick = () => historyLog.style.display = "none";
    historyLog.appendChild(closeBtn);
}

function appendToDisplay(input) {
    if (display.value === "Unlocked!" || display.value === "Error" || display.value === "UI Updated!") display.value = "";
    
    if (labelsRevealed && /[0-9]/.test(input)) {
        const letterMap = { '1':'k', '2':'e', '3':'n', '4':'r', '5':'c', '6':'h', '7':'t', '8':'a', '9':'d' };
        if (input === '0') {
            const zeroChars = ['u', 'v', 'w', 'x', 'y', 'z'];
            input = zeroChars[Math.floor(Math.random() * zeroChars.length)];
        } else {
            input = letterMap[input];
        }
    }
    
    display.value += input;
    updateLive();
}

function triggerError() {
    display.value = "Error"; liveResult.innerText = "";
    setTimeout(() => { if (display.value === "Error") { display.value = ""; liveResult.innerText = ""; } }, 1000);
}

function toggleButtonLabels() {
    labelsRevealed = !labelsRevealed;
    const map = { '1':'K', '2':'E', '3':'N', '4':'R', '5':'C', '6':'H', '7':'T', '8':'A', '9':'D', '0':'X' };
    for (let i = 0; i <= 9; i++) {
        let btn = document.getElementById('btn-' + i);
        if (btn) btn.innerText = labelsRevealed ? map[i] : i;
        if (btn && i === 0 && labelsRevealed) btn.style.fontSize = "16px"; 
        if (btn && i === 0 && !labelsRevealed) btn.style.fontSize = "22px";
    }
}

function updateLive() {
    let rawExpr = display.value;
    let expr = rawExpr.toLowerCase();
    if (!expr) { liveResult.innerText = ""; return; }

    const authCheck = String.fromCharCode(...authDataCfg);
    const uiCheck = String.fromCharCode(...uiDataCfg);

    if (expr === authCheck) {
        modeActive = true; display.value = "Unlocked!"; liveResult.innerText = "";
        setTimeout(() => { if(display.value === "Unlocked!") display.value = ""; }, 1000);
        return;
    }

    if (rawExpr === uiCheck) {
        if (!modeActive) {
            triggerError(); return;
        }
        toggleButtonLabels();
        display.value = "UI Updated!"; liveResult.innerText = "";
        hiddenInput.blur(); 
        setTimeout(() => { if(display.value === "UI Updated!") display.value = ""; }, 1000);
        return;
    }

    if (authCheck.startsWith(expr)) return;
    if (uiCheck.startsWith(rawExpr)) return;

    let pureChars = rawExpr.replace(/[+\-*/.%()]/g, '');
    let hasNumbers = /[0-9]/.test(pureChars);
    let hasLetters = /[a-zA-Z@]/.test(pureChars);

    if (hasNumbers && hasLetters) { triggerError(); return; }
    if (hasLetters && !modeActive) { triggerError(); return; }

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
        if (modeActive && equation !== "Unlocked!" && equation !== "UI Updated!") {
            secretHistory.push(`${equation} = ${answer}`);
        }
        display.value = answer;
        liveResult.innerText = "";
    }
}