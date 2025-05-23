// Online Exam Portal Script

// --- Utility Functions ---
function formatDateTime(dt) {
    return dt.toLocaleString();
}
function formatTime(dt) {
    return dt.toLocaleTimeString();
}
function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}m ${sec}s`;
}

// --- Date & Time Display ---
function updateHeaderDateTime() {
    const headerH3 = document.getElementById('header-h3');
    if (headerH3) {
        const now = new Date();
        headerH3.textContent = `Date: ${now.toLocaleDateString()} | Time: ${now.toLocaleTimeString()}`;
    }
}

// --- Authentication ---
function handleLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginForm.querySelector('input[name="username"]').value.trim();
        const password = loginForm.querySelector('input[name="password"]').value.trim();
        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }
        // Three users: john/king, jane/queen, alice/ace
        if (
            (username === 'john' && password === 'king') ||
            (username === 'jane' && password === 'queen') ||
            (username === 'alice' && password === 'ace')
        ) {
            localStorage.setItem('currentUsername', username);
            alert('Login successful!');
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials. Please try again.');
        }
    });
}

function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUsername');
            window.location.href = 'login-index.html';
        });
    }
}

function handleSignup() {
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            window.location.href = 'signup.html';
        });
    }
}

// --- User Greeting ---
function showUserGreeting() {
    const mainElement = document.querySelector('main');
    const username = localStorage.getItem('currentUsername');
    if (mainElement && username) {
        const userDisplay = document.createElement('div');
        userDisplay.textContent = `Welcome, ${username}!`;
        userDisplay.style.marginBottom = '1em';
        mainElement.prepend(userDisplay);
    }
}

// --- Quiz Data ---
const quizData = [ {
        question: "Which of the following is a JavaScript data type?",
        options: {
            a: "String",
            b: "Number",
            c: "Boolean",
            d: "Object",
            e: "All of the above",
            f: "",
            g: "",
            h: "",
            i: "",
            j: "",
            k: "",
            l: "",
            m: "",
            n: "",
            o: "",
            p: "",
            q: "",
            r: "",
            s: "",
            t: ""
        },
        correct: ["e"]
    },
    {
        question: "Select all primitive data types in JavaScript.",
        options: {
            a: "String",
            b: "Number",
            c: "Boolean",
            d: "Object",
            e: "Undefined",
            f: "Null",
            g: "Symbol",
            h: "BigInt",
            i: "",
            j: "",
            k: "",
            l: "",
            m: "",
            n: "",
            o: "",
            p: "",
            q: "",
            r: "",
            s: "",
            t: ""
        },
        correct: ["a", "b", "c", "e", "f", "g", "h"]
    }

    ,
    {
        question: "What is the output of: console.log(typeof null);",
        options: {
            a: "'object'",
            b: "'null'",
            c: "'undefined'",
            d: "'number'",
            e: "",
            f: "",
            g: "",
            h: "",
            i: "",
            j: "",
            k: "",
            l: "",
            m: "",
            n: "",
            o: "",
            p: "",
            q: "",
            r: "",
            s: "",
            t: ""
        },
        correct: ["a"]
    }, ];

// --- Quiz Logic ---
let quizStartTime, quizEndTime, quizDuration;
let currentQuiz = 0, score = 0;

function clearAnswers(answerEls) {
    answerEls.forEach(el => {
        if (el.type === "radio" || el.type === "checkbox") el.checked = false;
    });
}

function loadQuiz() {
    const questionEl = document.getElementById('question');
    const answerEls = document.querySelectorAll('.answer');
    const resultEl = document.getElementById('result');
    if (!questionEl || !answerEls.length) return;
    clearAnswers(answerEls);
    resultEl.style.display = "none";
    const q = quizData[currentQuiz];
    questionEl.innerText = q.question;
    Object.keys(q.options).forEach(key => {
        const input = document.getElementById(key);
        const label = document.getElementById(`${key}_text`);
        if (!input || !label) return;
        if (q.options[key]) {
            input.parentElement.style.display = '';
            label.innerText = q.options[key];
            input.disabled = false;
        } else {
            input.parentElement.style.display = 'none';
            label.innerText = '';
            input.disabled = true;
        }
        input.type = q.correct.length > 1 ? "checkbox" : "radio";
    });
}

function getSelectedAnswers(answerEls) {
    return Array.from(answerEls)
        .filter(el => !el.disabled && el.checked)
        .map(el => el.id);
}

function saveUserAnswer(selected) {
    quizData[currentQuiz].userSelected = selected;
}

function showResult() {
    const questionEl = document.getElementById('question');
    const answerEls = document.querySelectorAll('.answer');
    const submitBtn = document.getElementById('submit');
    const resultEl = document.getElementById('result');
    const scoreEl = document.getElementById('score');
    questionEl.innerText = '';
    answerEls.forEach(el => el.parentElement.style.display = 'none');
    submitBtn.style.display = 'none';
    resultEl.style.display = 'block';
    scoreEl.innerText = `${score} / ${quizData.length}`;
    saveQuizResultToStorage();
    if (!document.getElementById('export-pdf')) {
        const pdfBtn = document.createElement('button');
        pdfBtn.id = 'export-pdf';
        pdfBtn.innerText = 'Export PDF';
        pdfBtn.onclick = exportPDF;
        resultEl.appendChild(pdfBtn);
    }
}

function handleQuiz() {
    const answerEls = document.querySelectorAll('.answer');
    const submitBtn = document.getElementById('submit');
    const restartBtn = document.getElementById('restart');
    if (!submitBtn || !restartBtn) return;

    quizStartTime = new Date();
    quizEndTime = null;
    quizDuration = null;
    currentQuiz = 0;
    score = 0;
    loadQuiz();

    submitBtn.onclick = () => {
        const selected = getSelectedAnswers(answerEls);
        if (!selected.length) return;
        saveUserAnswer(selected);
        const correct = quizData[currentQuiz].correct;
        const isCorrect = correct.length === selected.length && correct.every(ans => selected.includes(ans));
        if (isCorrect) score++;
        currentQuiz++;
        if (currentQuiz < quizData.length) {
            loadQuiz();
        } else {
            quizEndTime = new Date();
            quizDuration = quizEndTime - quizStartTime;
            showResult();
        }
    };

    restartBtn.onclick = () => {
        quizData.forEach(q => delete q.userSelected);
        currentQuiz = 0;
        score = 0;
        submitBtn.style.display = '';
        const pdfBtn = document.getElementById('export-pdf');
        if (pdfBtn) pdfBtn.remove();
        quizStartTime = new Date();
        quizEndTime = null;
        quizDuration = null;
        loadQuiz();
    };
}

// --- PDF Export ---
function exportPDF() {
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = generatePDF;
        document.body.appendChild(script);
    } else {
        generatePDF();
    }

    function generatePDF() {
        const { jsPDF } = window.jspdf || window;
        const doc = new jsPDF();
        let y = 15;
        const quizTakerName = localStorage.getItem('currentUsername') || 'Unknown';
        doc.setFontSize(18).setTextColor(21, 101, 192).text('Quiz Results', 10, y);
        y += 10;
        doc.setFontSize(12).setTextColor(67, 160, 71).text(`Name: ${quizTakerName}`, 10, y);
        y += 7;
        doc.setTextColor(255, 143, 0).text(`Date: ${formatDateTime(quizStartTime)}`, 10, y);
        y += 7;
        doc.setTextColor(30, 136, 229).text(`Quiz Start: ${formatTime(quizStartTime)}`, 10, y);
        y += 7;
        doc.setTextColor(239, 83, 80).text(`Quiz End: ${quizEndTime ? formatTime(quizEndTime) : '-'}`, 10, y);
        y += 7;
        doc.setTextColor(123, 31, 162).text(`Duration: ${quizDuration ? formatDuration(quizDuration) : '-'}`, 10, y);
        y += 10;
        doc.setFontSize(14).setTextColor(0, 0, 0).text(`Score: ${score} / ${quizData.length}`, 10, y);
        y += 10;
        quizData.forEach((q, idx) => {
            if (y > 270) { doc.addPage(); y = 15; }
            doc.setFont(undefined, 'bold').setTextColor(21, 101, 192).text(`${idx + 1}. ${q.question}`, 10, y);
            y += 7;
            doc.setFont(undefined, 'normal');
            Object.keys(q.options).forEach(optKey => {
                const optText = q.options[optKey];
                if (!optText) return;
                let marker = '', fillColor = null;
                let isUser = q.userSelected && q.userSelected.includes(optKey);
                let isCorrect = q.correct.includes(optKey);
                if (isUser && isCorrect) { marker = '✔️ (Correct)'; fillColor = [200, 255, 200]; }
                else if (isUser) { marker = '✔️'; fillColor = [255, 236, 179]; }
                else if (isCorrect) { marker = '(Correct)'; fillColor = [200, 255, 200]; }
                if (fillColor) { doc.setFillColor(...fillColor); doc.rect(10, y - 4, 190, 7, 'F'); }
                doc.setTextColor(0, 0, 0).text(`   ${optKey.toUpperCase()}: ${optText} ${marker}`, 12, y);
                y += 6;
            });
            y += 2;
        });
        doc.save('quiz_result.pdf');
    }
}

// --- Quiz Result Storage ---
function saveQuizResultToStorage() {
    const quizTakerName = localStorage.getItem('currentUsername') || 'Unknown';
    const result = {
        name: quizTakerName,
        date: formatDateTime(quizStartTime),
        startTime: formatTime(quizStartTime),
        endTime: quizEndTime ? formatTime(quizEndTime) : '-',
        duration: quizDuration ? formatDuration(quizDuration) : '-',
        score: `${score} / ${quizData.length}`,
        quizData: quizData.map(q => ({
            question: q.question,
            options: q.options,
            correct: q.correct,
            userSelected: q.userSelected || []
        }))
    };
    let allResults = [];
    try { allResults = JSON.parse(localStorage.getItem('quizResults')) || []; } catch (e) {}
    allResults.push(result);
    localStorage.setItem('quizResults', JSON.stringify(allResults));
}

// --- Dashboard Result History ---
function showExamHistory() {
    const resultDiv = document.querySelector('.result');
    if (!resultDiv) return;
    let allResults = [];
    try { allResults = JSON.parse(localStorage.getItem('quizResults')) || []; } catch (e) {}
    if (allResults.length === 0) {
        resultDiv.innerHTML = '<p>No exams taken yet.</p>';
        return;
    }
    resultDiv.innerHTML = '<h3>Exam History</h3>';
    allResults.forEach((res, idx) => {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '1em';
        wrapper.innerHTML = `
            <strong>${res.name}</strong> | Date: ${res.date} | Score: ${res.score}
            <button id="pdf-link-${idx}">Download PDF</button>
        `;
        resultDiv.appendChild(wrapper);
        document.getElementById(`pdf-link-${idx}`).onclick = () => exportPDFfromResult(res);
    });
}

function exportPDFfromResult(result) {
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => generatePDFfromResult(result);
        document.body.appendChild(script);
    } else {
        generatePDFfromResult(result);
    }
}

function generatePDFfromResult(result) {
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF();
    let y = 15;
    doc.setFontSize(18).setTextColor(21, 101, 192).text('Quiz Results', 10, y);
    y += 10;
    doc.setFontSize(12).setTextColor(67, 160, 71).text(`Name: ${result.name}`, 10, y);
    y += 7;
    doc.setTextColor(255, 143, 0).text(`Date: ${result.date}`, 10, y);
    y += 7;
    doc.setTextColor(30, 136, 229).text(`Quiz Start: ${result.startTime}`, 10, y);
    y += 7;
    doc.setTextColor(239, 83, 80).text(`Quiz End: ${result.endTime}`, 10, y);
    y += 7;
    doc.setTextColor(123, 31, 162).text(`Duration: ${result.duration}`, 10, y);
    y += 10;
    doc.setFontSize(14).setTextColor(0, 0, 0).text(`Score: ${result.score}`, 10, y);
    y += 10;
    result.quizData.forEach((q, idx) => {
        if (y > 270) { doc.addPage(); y = 15; }
        doc.setFont(undefined, 'bold').setTextColor(21, 101, 192).text(`${idx + 1}. ${q.question}`, 10, y);
        y += 7;
        doc.setFont(undefined, 'normal');
        Object.keys(q.options).forEach(optKey => {
            const optText = q.options[optKey];
            if (!optText) return;
            let marker = '', fillColor = null;
            let isUser = q.userSelected && q.userSelected.includes(optKey);
            let isCorrect = q.correct.includes(optKey);
            if (isUser && isCorrect) { marker = '✔️ (Correct)'; fillColor = [200, 255, 200]; }
            else if (isUser) { marker = '✔️'; fillColor = [255, 236, 179]; }
            else if (isCorrect) { marker = '(Correct)'; fillColor = [200, 255, 200]; }
            if (fillColor) { doc.setFillColor(...fillColor); doc.rect(10, y - 4, 190, 7, 'F'); }
            doc.setTextColor(0, 0, 0).text(`   ${optKey.toUpperCase()}: ${optText} ${marker}`, 12, y);
            y += 6;
        });
        y += 2;
    });
    doc.save('quiz_result.pdf');
}

// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderDateTime();
    handleLogin();
    handleLogout();
    handleSignup();
    showUserGreeting();
    handleQuiz();
    showExamHistory();
});