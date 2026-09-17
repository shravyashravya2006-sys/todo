/* ==========================================================================
   ElectiSphere - Main Application JavaScript Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. State & Data Models
       -------------------------------------------------------------------------- */
    
    // Accessibility Preferences
    const appState = {
        theme: localStorage.getItem('electisphere_theme') || 'dark',
        fontSize: localStorage.getItem('electisphere_font') || 'medium',
        lang: localStorage.getItem('electisphere_lang') || 'en',
        activeStage: 1,
        activePersona: 'first-time',
        simStep: 1,
        simChoices: { mayor: '', rep: '', propA: '' },
        quizIndex: 0,
        quizScore: 0,
        quizStreak: 0,
        glossaryView: 'list',
        glossaryCategory: 'all',
        swingStates: {
            PA: { name: 'Pennsylvania', ev: 19, winner: 'A' },
            GA: { name: 'Georgia', ev: 16, winner: 'B' },
            MI: { name: 'Michigan', ev: 15, winner: 'A' },
            WI: { name: 'Wisconsin', ev: 10, winner: 'A' },
            AZ: { name: 'Arizona', ev: 11, winner: 'B' },
            NC: { name: 'North Carolina', ev: 16, winner: 'B' },
            NV: { name: 'Nevada', ev: 6, winner: 'A' }
        },
        baseCandidateAVotes: 160,
        baseCandidateBVotes: 245
    };

    // 6 Stages Data
    const stageData = {
        1: {
            name: "Voter Registration & Qualification",
            timing: "Continuous — Up to 30 Days Before Election Day",
            summary: "The foundational stage where citizens establish their legal eligibility to vote in their specific election district.",
            voterActions: [
                "Verify your current registration status online or with local election clerk.",
                "Update address or name if you recently moved or changed legal credentials.",
                "Review state eligibility rules (Age 18 by election day, citizenship, residency length).",
                "Choose political party affiliation if participating in closed party primaries."
            ],
            safeguards: [
                "Systematic voter roll maintenance to prevent duplicate registrations.",
                "Non-partisan verification of citizenship & residency credentials.",
                "NVR Act protections ensuring accessible registration at DMV and federal offices."
            ],
            documents: ["State ID / Driver's License", "Social Security Number (last 4 digits)", "Proof of Residency (utility bill/lease)"]
        },
        2: {
            name: "Primaries & Party Caucuses",
            timing: "6 to 9 Months Before General Election",
            summary: "Political parties choose their official nominee candidates through state-by-state primary elections or community caucus meetings.",
            voterActions: [
                "Determine if your state holds 'Open' (all voters) or 'Closed' (registered party members only) primaries.",
                "Research primary candidates running for presidential, congressional, and state offices.",
                "Cast your ballot in the primary to help decide who appears on the general ballot."
            ],
            safeguards: [
                "Bipartisan oversight at every primary polling station.",
                "Official candidate ballot access petition verification requirements."
            ],
            documents: ["Government Photo ID", "Voter Registration Card / Confirmation"]
        },
        3: {
            name: "General Campaigning & Debates",
            timing: "3 to 6 Months Leading Up to Voting Day",
            summary: "Nominated candidates present their policy platforms, hold public debates, and campaign across communities to win voter support.",
            voterActions: [
                "Watch non-partisan debates to evaluate candidate stances on key issues.",
                "Utilize official voter guides to review non-partisan ballot measure descriptions.",
                "Determine your voting preference (In-Person Early, Election Day, or Mail-In)."
            ],
            safeguards: [
                "Campaign finance disclosure rules monitored by federal/state ethics commissions.",
                "Equal time and broadcasting access regulations for news coverage."
            ],
            documents: ["Sample Ballot (to mark preferences ahead of time)"]
        },
        4: {
            name: "Voting Period (Early & Election Day)",
            timing: "Early Voting Window (up to 30 days) + Official Election Day",
            summary: "Voters cast their secret ballots either by mail, at early voting centers, or at local polling places on Election Day.",
            voterActions: [
                "In-Person: Locate your designated polling location and check hours.",
                "Mail-In: Carefully follow envelope signing instructions and mail early or drop at official box.",
                "If issues arise at check-in, request a Provisional Ballot."
            ],
            safeguards: [
                "Secret Ballot: Votes are decoupled from voter identity once verified.",
                "Poll Observers: Credentialed observers from major parties watch polling procedures.",
                "Strict physical security on drop boxes and tabulator machines."
            ],
            documents: ["Accepted Photo ID (per state rules)", "Mail Ballot Envelope (if returning by mail)"]
        },
        5: {
            name: "Vote Tabulation & Audits",
            timing: "Election Night through ~10 Days Post-Election",
            summary: "Tabulators scan paper ballots and bipartisan canvassing boards verify every count, including mail-in signature matching and provisional checks.",
            voterActions: [
                "Track your mail ballot status online via state ballot tracking portals.",
                "Follow official election results certified by election boards rather than premature media calls."
            ],
            safeguards: [
                "Air-Gapped Scanners: Voting machines never connect to the internet.",
                "Post-Election Audits: Hand-counting physical paper sample ballots to verify machine accuracy.",
                "Signature Matching: Double verification on mail-in ballot envelopes."
            ],
            documents: ["Ballot Tracking Receipt / Confirmation Number"]
        },
        6: {
            name: "Official Certification & Swearing-In",
            timing: "30-60 Days Post-Election (December - January)",
            summary: "Election boards formally certify election results, Electoral College electors cast official votes, and winning officials are sworn into office.",
            voterActions: [
                "Review certified election tallies published on official secretary of state portals.",
                "Prepare for civic engagement with newly elected representatives."
            ],
            safeguards: [
                "Formal legal challenge window with judicial review oversight.",
                "Congressional and state legislative joint session validation."
            ],
            documents: ["Official Certificate of Election"]
        }
    };

    // Myth vs Fact Quiz Questions
    const quizData = [
        {
            q: "Myth or Fact: If you are standing in line when the polls officially close, you are legally entitled to vote.",
            options: ["FACT (True)", "MYTH (False)"],
            correct: 0,
            exp: "FACT: Under federal and state election laws, if you are in line at your designated polling station before the scheduled closing time, poll workers MUST allow you to cast your ballot!"
        },
        {
            q: "Myth or Fact: Electronic voting machines and paper optical tabulators are connected to the Wi-Fi internet.",
            options: ["FACT (True)", "MYTH (False)"],
            correct: 1,
            exp: "MYTH: Election voting tabulators are completely air-gapped and legally prohibited from connecting to the internet or external networks, preventing remote hacking."
        },
        {
            q: "Myth or Fact: Mail-in ballots are only counted if an election is super close.",
            options: ["FACT (True)", "MYTH (False)"],
            correct: 1,
            exp: "MYTH: All validly submitted mail-in and absentee ballots are legally required to be counted in every single election, regardless of victory margins."
        },
        {
            q: "Myth or Fact: If your name isn't found on the registration roll, you must leave without voting.",
            options: ["FACT (True)", "MYTH (False)"],
            correct: 1,
            exp: "MYTH: You have the right to request a Provisional Ballot! Election workers will record your vote and count it once your eligibility is verified."
        },
        {
            q: "Myth or Fact: A paper ballot trail exists for over 95% of votes cast in the US.",
            options: ["FACT (True)", "MYTH (False)"],
            correct: 0,
            exp: "FACT: Almost all voting systems in modern elections rely on physical paper ballots marked by hand or printed by ballot-marking devices for audit hand-counts."
        }
    ];

    // Glossary Terms Data
    const glossaryTerms = [
        { term: "Absentee / Mail-In Ballot", cat: "voting", def: "A ballot completed and submitted by a registered voter prior to election day, delivered via mail or official drop box." },
        { term: "Air-Gapped System", cat: "mechanics", def: "Computers or tabulators that are physically isolated from any computer network or internet connectivity to prevent cyber threats." },
        { term: "Canvassing Board", cat: "mechanics", def: "A bipartisan group of election officials responsible for checking, tabulating, and certifying official election results." },
        { term: "Closed Primary", cat: "stages", def: "A primary election in which only voters registered with a specific political party can vote for that party's candidates." },
        { term: "Electoral College", cat: "mechanics", def: "The official constitutional body that elects the US President and Vice President based on state-by-state electoral vote allocations." },
        { term: "Gerrymandering", cat: "stages", def: "The practice of manipulating legislative district boundaries to favor one political party or demographic group." },
        { term: "Optical Scanner Tabulator", cat: "mechanics", def: "An electronic machine that reads dark oval markings on paper ballots, instantly recording votes while dropping paper into locked storage." },
        { term: "Provisional Ballot", cat: "voting", def: "A vote cast by a voter whose eligibility cannot be verified at the poll station. It is held securely until eligibility is confirmed." },
        { term: "Ranked-Choice Voting", cat: "voting", def: "An electoral system where voters rank candidates in order of preference (1st, 2nd, 3rd) rather than picking just one." },
        { term: "Referendum / Ballot Measure", cat: "stages", def: "A proposed law, constitutional amendment, or policy issue placed directly on the ballot for citizens to approve or reject." },
        { term: "Risk-Limiting Audit (RLA)", cat: "mechanics", def: "A statistically sound procedure where paper ballots are hand-checked to guarantee machine tabulator accuracy before certification." },
        { term: "Voter Roll", cat: "voting", def: "The official master list of registered voters eligible to vote within a specific county or precinct." }
    ];

    /* --------------------------------------------------------------------------
       2. Accessibility & Theme Management
       -------------------------------------------------------------------------- */
    function applyAccessibility() {
        document.documentElement.setAttribute('data-theme', appState.theme);
        document.documentElement.setAttribute('data-fontsize', appState.fontSize);

        // Update Theme Button Active Classes
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.themeVal === appState.theme);
        });

        // Update Font Size Active Classes
        document.querySelectorAll('.font-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === appState.fontSize);
        });

        // Save preferences
        localStorage.setItem('electisphere_theme', appState.theme);
        localStorage.setItem('electisphere_font', appState.fontSize);
        localStorage.setItem('electisphere_lang', appState.lang);
    }

    // Toggle Dropdown
    const accessBtn = document.getElementById('access-btn');
    const accessDropdown = document.getElementById('access-dropdown');
    if (accessBtn && accessDropdown) {
        accessBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            accessDropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => accessDropdown.classList.remove('show'));
        accessDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    // Theme Switchers
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            appState.theme = btn.dataset.themeVal;
            applyAccessibility();
        });
    });

    // Font Switchers
    document.querySelectorAll('.font-option').forEach(btn => {
        btn.addEventListener('click', () => {
            appState.fontSize = btn.dataset.size;
            applyAccessibility();
        });
    });

    applyAccessibility();

    /* --------------------------------------------------------------------------
       3. Persona Tip Card Switcher
       -------------------------------------------------------------------------- */
    const personaTips = {
        'first-time': "<strong>First-Time Voter:</strong> Start with Stage 1 (Registration) to check deadlines, then try our <strong>VoteSim Studio</strong> to feel 100% prepared on voting day!",
        'mail-in': "<strong>Mail-In Voter:</strong> Make sure to check signature requirements on your outer envelope and track your ballot using official state tracking tools!",
        'in-person': "<strong>In-Person Voter:</strong> Find your designated precinct poll location early, verify ID requirements, and remember: if you are in line before poll close, you can vote!",
        'curious': "<strong>Global Civic Observer:</strong> Compare Parliamentary vs Presidential electoral systems under Section 4 to learn how executive power is structured globally."
    };

    const personaChips = document.querySelectorAll('.persona-chip');
    const personaTipText = document.getElementById('persona-tip-text');

    personaChips.forEach(chip => {
        chip.addEventListener('click', () => {
            personaChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const personaKey = chip.dataset.persona;
            if (personaTips[personaKey] && personaTipText) {
                personaTipText.innerHTML = personaTips[personaKey];
            }
        });
    });

    /* --------------------------------------------------------------------------
       4. Stage Timeline Stepper Engine
       -------------------------------------------------------------------------- */
    const stageTabs = document.querySelectorAll('.step-tab');
    const stageDisplay = document.getElementById('stage-detail-display');

    function renderStage(stageNum) {
        const data = stageData[stageNum];
        if (!data || !stageDisplay) return;

        appState.activeStage = stageNum;

        // Update Stepper Active State
        stageTabs.forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.stage) === stageNum);
        });

        // Generate HTML
        const actionsHTML = data.voterActions.map(act => `<li>${act}</li>`).join('');
        const safeguardsHTML = data.safeguards.map(safe => `<li>${safe}</li>`).join('');
        const docsHTML = data.documents.map(doc => `<span class="badge">${doc}</span>`).join(' ');

        stageDisplay.innerHTML = `
            <div class="stage-detail-header">
                <div class="stage-title-wrap">
                    <div class="stage-badge-num">0${stageNum}</div>
                    <div>
                        <h3>${data.name}</h3>
                        <span class="step-timing">🕒 Expected Timing: ${data.timing}</span>
                    </div>
                </div>
                <div class="stage-actions">
                    <a href="#voting-plan-section" class="btn btn-primary btn-sm">Add to My Voting Plan &rarr;</a>
                </div>
            </div>

            <p class="stage-summary-text" style="font-size: 1.05rem; margin-bottom: 24px; color: var(--text-muted);">
                ${data.summary}
            </p>

            <div class="stage-main-grid">
                <div class="detail-block">
                    <h4>🗳️ Key Action Items for Voters</h4>
                    <ul class="check-list-items">
                        ${actionsHTML}
                    </ul>
                </div>

                <div class="detail-block">
                    <h4>🛡️ Security & Integrity Checks</h4>
                    <ul class="check-list-items">
                        ${safeguardsHTML}
                    </ul>

                    <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--border-color);">
                        <strong style="font-size: 0.85rem; display: block; margin-bottom: 8px; color: var(--text-muted);">Required Documents / Resources:</strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${docsHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    stageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            renderStage(parseInt(tab.dataset.stage));
        });
    });

    renderStage(1); // Default to Stage 1

    /* --------------------------------------------------------------------------
       5. VoteSim Studio Logic
       -------------------------------------------------------------------------- */
    const simStepInds = document.querySelectorAll('.sim-step-indicator');
    const simScreens = document.querySelectorAll('.sim-screen');

    function goToSimStep(stepNum) {
        appState.simStep = stepNum;

        simStepInds.forEach((ind, i) => {
            ind.classList.toggle('active', (i + 1) === stepNum);
        });

        simScreens.forEach((scr, i) => {
            scr.classList.toggle('active', (i + 1) === stepNum);
        });
    }

    // Step 1: Check-in
    const checkinBtn = document.getElementById('sim-checkin-btn');
    if (checkinBtn) {
        checkinBtn.addEventListener('click', () => {
            const nameVal = document.getElementById('sim-name').value.trim();
            if (!nameVal) {
                alert("Please enter a practice name for check-in!");
                return;
            }
            goToSimStep(2);
        });
    }

    // Step 2: Ballot Selection & Navigation
    const backTo1Btn = document.getElementById('sim-back-to-1');
    const proceedTo3Btn = document.getElementById('sim-proceed-to-3');

    if (backTo1Btn) backTo1Btn.addEventListener('click', () => goToSimStep(1));
    if (proceedTo3Btn) {
        proceedTo3Btn.addEventListener('click', () => {
            // Collect ballot choices
            const mayorSel = document.querySelector('input[name="mayor"]:checked');
            const repSel = document.querySelector('input[name="rep"]:checked');
            const propASel = document.querySelector('input[name="propA"]:checked');

            appState.simChoices.mayor = mayorSel ? mayorSel.value : 'No Choice (Blank)';
            appState.simChoices.rep = repSel ? repSel.value : 'No Choice (Blank)';
            appState.simChoices.propA = propASel ? propASel.value : 'No Choice (Blank)';

            goToSimStep(3);
        });
    }

    // Step 3: Scanner Animation
    const startScanBtn = document.getElementById('start-scan-btn');
    const paperFeed = document.getElementById('paper-feed-element');
    const scannerStatus = document.getElementById('scanner-status-text');

    if (startScanBtn && paperFeed && scannerStatus) {
        startScanBtn.addEventListener('click', () => {
            startScanBtn.disabled = true;
            scannerStatus.innerHTML = `<span style="color: #f59e0b;">READING OPTICAL MARKINGS...</span>`;
            paperFeed.classList.add('feeding');

            setTimeout(() => {
                scannerStatus.innerHTML = `<span style="color: #10b981;">✓ BALLOT RECORDED & STORED!</span>`;
                setTimeout(() => {
                    renderSimReceipt();
                    goToSimStep(4);
                    startScanBtn.disabled = false;
                    paperFeed.classList.remove('feeding');
                }, 900);
            }, 1400);
        });
    }

    function renderSimReceipt() {
        const detailsContainer = document.getElementById('receipt-details');
        const nameVal = document.getElementById('sim-name').value || 'Jane Reader';

        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <p><strong>Voter:</strong> ${nameVal} (Verified)</p>
                <p><strong>Status:</strong> Counted & Audited</p>
                <hr style="margin: 10px 0; border: none; border-top: 1px dashed #cbd5e1;">
                <p><strong>Mayor:</strong> ${appState.simChoices.mayor}</p>
                <p><strong>Representative:</strong> ${appState.simChoices.rep}</p>
                <p><strong>Prop A:</strong> ${appState.simChoices.propA}</p>
            `;
        }
    }

    const resetSimBtn = document.getElementById('sim-reset-btn');
    if (resetSimBtn) resetSimBtn.addEventListener('click', () => goToSimStep(1));

    const printReceiptBtn = document.getElementById('print-receipt-btn');
    if (printReceiptBtn) {
        printReceiptBtn.addEventListener('click', () => {
            window.print();
        });
    }

    /* --------------------------------------------------------------------------
       6. "My Voting Readiness Plan" Generator & LocalStorage
       -------------------------------------------------------------------------- */
    const planForm = document.getElementById('voter-plan-form');
    const checklistContainer = document.getElementById('checklist-items-container');
    const progressFill = document.getElementById('plan-progress-fill');
    const progressTag = document.getElementById('plan-progress-tag');

    let userPlanItems = JSON.parse(localStorage.getItem('electisphere_user_plan')) || [];

    function generatePlanFromForm() {
        const regStatus = document.getElementById('voter-reg-status').value;
        const method = document.getElementById('voter-method').value;
        const reminder = document.getElementById('voter-reminder-day').value.trim() || 'Election Day';

        userPlanItems = [
            { text: "Check your voter registration status on your official local election site", done: false },
            { text: "Confirm your designated polling station address and opening hours", done: false },
            { text: `Prepare accepted photo ID for voting via: ${method.replace('-', ' ')}`, done: false },
            { text: `Review and fill out sample ballot ahead of time for ${reminder}`, done: false },
            { text: "Set a calendar reminder or arrange transportation to cast your ballot", done: false }
        ];

        if (regStatus === 'moved' || regStatus === 'never') {
            userPlanItems.unshift({ text: "Submit updated voter registration form before state deadline", done: false });
        }

        saveAndRenderPlan();
    }

    function saveAndRenderPlan() {
        localStorage.setItem('electisphere_user_plan', JSON.stringify(userPlanItems));

        if (!checklistContainer) return;

        checklistContainer.innerHTML = '';
        let completedCount = 0;

        userPlanItems.forEach((item, index) => {
            if (item.done) completedCount++;

            const div = document.createElement('div');
            div.className = `check-item ${item.done ? 'completed' : ''}`;
            div.innerHTML = `
                <input type="checkbox" id="plan-chk-${index}" ${item.done ? 'checked' : ''}>
                <label for="plan-chk-${index}" class="check-item-text">${item.text}</label>
            `;

            div.querySelector('input').addEventListener('change', (e) => {
                userPlanItems[index].done = e.target.checked;
                saveAndRenderPlan();
            });

            checklistContainer.appendChild(div);
        });

        const pct = userPlanItems.length ? Math.round((completedCount / userPlanItems.length) * 100) : 0;
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressTag) progressTag.textContent = `${completedCount} of ${userPlanItems.length} Completed (${pct}%)`;
    }

    if (planForm) {
        planForm.addEventListener('submit', (e) => {
            e.preventDefault();
            generatePlanFromForm();
        });
    }

    const clearPlanBtn = document.getElementById('clear-plan-btn');
    if (clearPlanBtn) {
        clearPlanBtn.addEventListener('click', () => {
            userPlanItems = [];
            localStorage.removeItem('electisphere_user_plan');
            generatePlanFromForm();
        });
    }

    const exportPlanBtn = document.getElementById('export-plan-btn');
    if (exportPlanBtn) {
        exportPlanBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Initial plan render
    if (!userPlanItems.length) {
        generatePlanFromForm();
    } else {
        saveAndRenderPlan();
    }

    /* --------------------------------------------------------------------------
       7. Electoral Mechanics Visualizer & Swing State Simulator
       -------------------------------------------------------------------------- */
    const mechTabs = document.querySelectorAll('.mech-tab-btn');
    const mechPanels = document.querySelectorAll('.mech-panel');

    mechTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            mechTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const mechTarget = tab.dataset.mech;
            mechPanels.forEach(p => {
                p.classList.toggle('active', p.id === `mech-panel-${mechTarget}`);
            });
        });
    });

    const slidersContainer = document.getElementById('state-sliders-container');

    function renderElectoralSim() {
        if (!slidersContainer) return;

        slidersContainer.innerHTML = '';
        let totalA = appState.baseCandidateAVotes;
        let totalB = appState.baseCandidateBVotes;

        Object.keys(appState.swingStates).forEach(key => {
            const state = appState.swingStates[key];
            if (state.winner === 'A') totalA += state.ev;
            else totalB += state.ev;

            const div = document.createElement('div');
            div.className = 'slider-group';
            div.innerHTML = `
                <div class="slider-label-row">
                    <span>${state.name} (${state.ev} Electoral Votes)</span>
                    <span style="color: ${state.winner === 'A' ? '#3b82f6' : '#ef4444'}; font-weight: 700;">
                        Leans Candidate ${state.winner}
                    </span>
                </div>
                <input type="range" min="0" max="1" step="1" value="${state.winner === 'A' ? 0 : 1}" class="slider-control" id="slider-${key}">
            `;

            div.querySelector('.slider-control').addEventListener('input', (e) => {
                appState.swingStates[key].winner = e.target.value === '0' ? 'A' : 'B';
                renderElectoralSim();
            });

            slidersContainer.appendChild(div);
        });

        // Update Total Bars
        const candAVotesEl = document.getElementById('cand-a-votes');
        const candBVotesEl = document.getElementById('cand-b-votes');
        const candABar = document.getElementById('cand-a-bar');
        const candBBar = document.getElementById('cand-b-bar');

        if (candAVotesEl) candAVotesEl.textContent = totalA;
        if (candBVotesEl) candBVotesEl.textContent = totalB;

        const totalEV = 538;
        const aPct = Math.round((totalA / totalEV) * 100);
        const bPct = Math.round((totalB / totalEV) * 100);

        if (candABar) candABar.style.width = `${aPct}%`;
        if (candBBar) candBBar.style.width = `${bPct}%`;
    }

    renderElectoralSim();

    /* --------------------------------------------------------------------------
       8. Myth vs. Fact Interactive Quiz Engine
       -------------------------------------------------------------------------- */
    const quizBody = document.getElementById('quiz-body');
    const quizCurrNum = document.getElementById('quiz-curr-num');
    const quizStreakNum = document.getElementById('quiz-streak-num');
    const quizExp = document.getElementById('quiz-explanation');
    const quizNextBtn = document.getElementById('quiz-next-btn');

    function renderQuizQuestion() {
        if (!quizBody) return;

        if (appState.quizIndex >= quizData.length) {
            // Quiz Finished
            quizBody.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🏆</div>
                    <h3>Quiz Complete! Your Score: ${appState.quizScore} / ${quizData.length}</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        Congratulations! You've unlocked the <strong>Certified Civic Scholar Badge</strong>!
                    </p>
                    <button class="btn btn-primary" id="restart-quiz-btn">🔄 Retake Quiz</button>
                </div>
            `;
            if (quizExp) quizExp.style.display = 'none';
            if (quizNextBtn) quizNextBtn.style.display = 'none';

            document.getElementById('restart-quiz-btn').addEventListener('click', () => {
                appState.quizIndex = 0;
                appState.quizScore = 0;
                appState.quizStreak = 0;
                renderQuizQuestion();
            });
            return;
        }

        const qObj = quizData[appState.quizIndex];
        if (quizCurrNum) quizCurrNum.textContent = appState.quizIndex + 1;
        if (quizStreakNum) quizStreakNum.textContent = appState.quizStreak;

        if (quizExp) quizExp.style.display = 'none';
        if (quizNextBtn) quizNextBtn.style.display = 'none';

        const optsHTML = qObj.options.map((opt, i) => `
            <button class="quiz-opt-btn" data-opt-idx="${i}">${opt}</button>
        `).join('');

        quizBody.innerHTML = `
            <div class="quiz-question-title">${qObj.q}</div>
            <div class="quiz-options-list">
                ${optsHTML}
            </div>
        `;

        const optBtns = quizBody.querySelectorAll('.quiz-opt-btn');
        optBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedIdx = parseInt(btn.dataset.optIdx);
                const isCorrect = selectedIdx === qObj.correct;

                optBtns.forEach((b, i) => {
                    b.disabled = true;
                    if (i === qObj.correct) b.classList.add('correct');
                    else if (i === selectedIdx) b.classList.add('wrong');
                });

                if (isCorrect) {
                    appState.quizScore++;
                    appState.quizStreak++;
                } else {
                    appState.quizStreak = 0;
                }

                if (quizStreakNum) quizStreakNum.textContent = appState.quizStreak;

                if (quizExp) {
                    quizExp.innerHTML = `<strong>${isCorrect ? '✅ Correct!' : '❌ Not Quite!'}</strong> ${qObj.exp}`;
                    quizExp.style.display = 'block';
                }

                if (quizNextBtn) quizNextBtn.style.display = 'inline-flex';
            });
        });
    }

    if (quizNextBtn) {
        quizNextBtn.addEventListener('click', () => {
            appState.quizIndex++;
            renderQuizQuestion();
        });
    }

    renderQuizQuestion();

    /* --------------------------------------------------------------------------
       9. Civic Knowledge Hub & Glossary Search/Filter
       -------------------------------------------------------------------------- */
    const glossarySearchInput = document.getElementById('glossary-search');
    const glossaryPills = document.querySelectorAll('#glossary-category-pills .pill-btn');
    const viewListBtn = document.getElementById('view-list-btn');
    const viewCardsBtn = document.getElementById('view-cards-btn');
    const glossaryDisplay = document.getElementById('glossary-display-area');

    function renderGlossary() {
        if (!glossaryDisplay) return;

        const query = (glossarySearchInput ? glossarySearchInput.value : '').toLowerCase().trim();

        const filtered = glossaryTerms.filter(t => {
            const matchesCat = appState.glossaryCategory === 'all' || t.cat === appState.glossaryCategory;
            const matchesSearch = t.term.toLowerCase().includes(query) || t.def.toLowerCase().includes(query);
            return matchesCat && matchesSearch;
        });

        if (!filtered.length) {
            glossaryDisplay.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    No civic terms found matching your query.
                </div>
            `;
            return;
        }

        if (appState.glossaryView === 'list') {
            glossaryDisplay.className = 'glossary-display-area';
            glossaryDisplay.innerHTML = filtered.map(t => `
                <div class="glossary-card">
                    <span class="term-tag">${t.cat}</span>
                    <h4 class="term-title">${t.term}</h4>
                    <p class="term-def">${t.def}</p>
                </div>
            `).join('');
        } else {
            // Flashcard Mode
            glossaryDisplay.className = 'glossary-display-area';
            glossaryDisplay.innerHTML = filtered.map(t => `
                <div class="flashcard-wrapper">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <span class="term-tag">${t.cat}</span>
                            <h4 class="term-title">${t.term}</h4>
                            <span style="font-size: 0.75rem; color: var(--primary); margin-top: 10px;">Click card to flip 🔄</span>
                        </div>
                        <div class="flashcard-back">
                            <p class="term-def">${t.def}</p>
                        </div>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.flashcard-wrapper').forEach(fc => {
                fc.addEventListener('click', () => {
                    fc.classList.toggle('flipped');
                });
            });
        }
    }

    if (glossarySearchInput) glossarySearchInput.addEventListener('input', renderGlossary);

    glossaryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            glossaryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            appState.glossaryCategory = pill.dataset.cat;
            renderGlossary();
        });
    });

    if (viewListBtn && viewCardsBtn) {
        viewListBtn.addEventListener('click', () => {
            viewListBtn.classList.add('active');
            viewCardsBtn.classList.remove('active');
            appState.glossaryView = 'list';
            renderGlossary();
        });

        viewCardsBtn.addEventListener('click', () => {
            viewCardsBtn.classList.add('active');
            viewListBtn.classList.remove('active');
            appState.glossaryView = 'cards';
            renderGlossary();
        });
    }

    renderGlossary();

    /* --------------------------------------------------------------------------
       10. FAQ Accordion & Global Search Modal
       -------------------------------------------------------------------------- */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const qBtn = item.querySelector('.faq-question-btn');
        if (qBtn) {
            qBtn.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                faqItems.forEach(i => i.classList.remove('open'));
                if (!isOpen) item.classList.add('open');
            });
        }
    });

    // Global Search Modal
    const searchModal = document.getElementById('search-modal');
    const openSearchBtn = document.getElementById('open-search-btn');
    const closeSearchBtn = document.getElementById('close-search-btn');
    const globalSearchInput = document.getElementById('global-search-input');
    const globalSearchResults = document.getElementById('global-search-results');

    function openModal() {
        if (searchModal) {
            searchModal.style.display = 'flex';
            if (globalSearchInput) globalSearchInput.focus();
        }
    }

    function closeModal() {
        if (searchModal) searchModal.style.display = 'none';
    }

    if (openSearchBtn) openSearchBtn.addEventListener('click', openModal);
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openModal();
        }
        if (e.key === 'Escape') closeModal();
    });

    if (globalSearchInput && globalSearchResults) {
        globalSearchInput.addEventListener('input', () => {
            const query = globalSearchInput.value.toLowerCase().trim();
            if (!query) {
                globalSearchResults.innerHTML = '<div class="search-placeholder-text">Type a key term like "Registration", "Ballot", "Electoral", or "Audit"...</div>';
                return;
            }

            const stageMatches = Object.values(stageData).filter(s => s.name.toLowerCase().includes(query) || s.summary.toLowerCase().includes(query));
            const termMatches = glossaryTerms.filter(t => t.term.toLowerCase().includes(query) || t.def.toLowerCase().includes(query));

            let html = '';
            stageMatches.forEach(s => {
                html += `
                    <div class="search-result-item" onclick="document.getElementById('search-modal').style.display='none'; window.location.href='#lifecycle-section';">
                        <span class="term-tag">Election Stage</span>
                        <h4>${s.name}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${s.summary}</p>
                    </div>
                `;
            });

            termMatches.forEach(t => {
                html += `
                    <div class="search-result-item" onclick="document.getElementById('search-modal').style.display='none'; window.location.href='#glossary-section';">
                        <span class="term-tag">Glossary Term</span>
                        <h4>${t.term}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${t.def}</p>
                    </div>
                `;
            });

            globalSearchResults.innerHTML = html || '<div class="search-placeholder-text">No matching election topics found.</div>';
        });
    }

});
