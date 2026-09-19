# EXAMCRAFT — MASTER PRODUCT PLAN
**Vision, Product Direction, UX Philosophy & Long-Term Roadmap**  
*Master Specification for Antigravity*

---

## 0. Purpose of This Document

This document is the north star for **ExamCraft**.

The Dashboard Implementation Specification explains the immediate dashboard transformation.  
This document explains the larger question:

> **What is ExamCraft supposed to become?**

Antigravity should use this document when making future product, UX, architecture, navigation, and feature decisions.

Whenever there is a choice between:
- adding another feature,
- keeping an existing feature,
- changing navigation,
- designing a new page,
- introducing a new metric,
- adding automation,
- or simplifying something,

**evaluate the decision against this product vision.**

If a proposed feature does not strengthen the core preparation loop, it should not automatically be added.

---

## 1. PRODUCT VISION

### The Vision
ExamCraft should become:
> **A personal CAT preparation operating system that understands what the learner knows, what they struggle with, how they perform under time pressure, and what they should do next.**

It should **not** feel like:
- a generic LMS,
- a test marketplace,
- a coaching institute website,
- a question dump,
- a productivity app,
- or a collection of unrelated educational tools.

It should feel like:
> **"My personal CAT preparation command center."**

The product should reduce the mental effort required to decide:
> *"What should I study today?"*

Instead, the system should progressively answer that question for the learner.

---

## 2. THE CORE PRODUCT PROMISE

The product promise is:
> **Prepare deliberately. Practice intelligently. Learn from every mistake.**

The system should help the learner move through:

```
UNDERSTAND
    ↓
PRACTICE
    ↓
TEST
    ↓
ANALYSE
    ↓
IDENTIFY WEAKNESS
    ↓
FIX
    ↓
REVISE
    ↓
RETEST
```

The daily loop adds a first step:
```
WAKE UP
    ↓
WARM UP (Read → Think → Calculate)
    ↓
PREPARE (Today's CAT Plan)
    ↓
TEST (Sectional / Mock)
    ↓
ANALYSE
    ↓
FIX (Mistake Notebook)
    ↓
REVISE (Spaced Repetition Queue)
    ↓
REPEAT
```

This loop is the foundation of the entire product.

---

## 3. THE PRODUCT SHOULD HAVE A PERSONALITY

ExamCraft should feel:

- **Calm**: Not noisy or hyperactive.
- **Intelligent**: The interface should surface useful conclusions rather than simply display raw data.
- **Academic**: Serious enough for high-stakes exam preparation.
- **Personal**: The system should feel like it understands the learner's preparation state.
- **Focused**: Every screen should have a clear purpose.
- **Modern**: Clean UI, strong typography, responsive layouts, subtle interactions.
- **Practical**: Recommendations should result in an immediately actionable task.

---

## 4. WHAT EXAMCRAFT IS NOT

Avoid turning the product into:

### A feature marketplace
Do not keep adding:
- communities
- leaderboards
- badges
- social feeds
- generic courses
- unrelated exams
- educator marketplaces
- resource libraries
- generic productivity tools
*(unless there is a strong reason they improve CAT preparation).*

### A dashboard full of charts
More analytics does not automatically mean more intelligence. The user should not need to interpret ten graphs to understand what to do.

### A generic exam platform
The long-term learner experience should be **CAT-first**.

---

## 5. TARGET USER EXPERIENCE

The ideal daily experience is:

```
OPEN EXAMCRAFT
    ↓
"Good morning."
    ↓
SEE DAILY WARM-UP
    ↓
READ (AEON long-form article)
    ↓
THINK (Sudoku or chess puzzle)
    ↓
CALCULATE (5-question Smart Maths)
    ↓
"BRAIN WARMED UP"
    ↓
SEE TODAY'S PLAN
    ↓
PRACTICE (Topic / Section)
    ↓
TAKE MOCK / SECTIONAL
    ↓
ANALYSE PERFORMANCE
    ↓
REVIEW MISTAKES (Classify root cause)
    ↓
SYSTEM IDENTIFIES WEAKNESS
    ↓
NEXT PLAN ADJUSTS
    ↓
RETURN TOMORROW
```

The user should gradually develop a habit:
> **Open ExamCraft → warm up → prepare.**

---

## 6. PRODUCT ARCHITECTURE

The learner-facing product should eventually have five major areas:

### Primary Navigation
1. **HOME**: The Daily Command Center (Daily Warm-up, Today's CAT Plan, Current Focus, Progress, Consistency)
2. **LEARN**: Structured CAT Syllabus (VARC, DILR, QA) with topic mastery states
3. **PRACTICE**: Context-preserving practice engine (by subject, topic, weak areas, PYQs, mistakes)
4. **MOCKS**: High-value diagnostic events (Full CAT Mocks, Sectional Mocks, PYQs) with an ultra-clean exam interface
5. **ANALYSIS**: Actionable diagnostic coaching (Score, Accuracy, Time vs Accuracy, Error patterns, Weak areas)

### Secondary Navigation
- **MY GOAL**
- **SETTINGS**
- **PROFILE**

*Nothing else should compete with these.*

---

## 7. HOME — THE DAILY COMMAND CENTER

The homepage should not be an information dump.  
Its purpose: **Tell the learner what to do next.**

**Priority Order:**
1. Daily Warm-up
2. Today's CAT Plan
3. Current Focus
4. Progress
5. Consistency

---

## 8. DAILY WARM-UP — SIGNATURE FEATURE

The Daily Warm-up is the product's distinctive ritual (approx. 15–20 minutes):

1. **READ**: AEON / high-quality long-form article selected for the learner.
   - *Purpose*: comprehension, inference, vocabulary in context, argument recognition, reading stamina.
2. **THINK**: Sudoku or chess puzzle.
   - *Purpose*: logical activation, pattern recognition, concentration, cognitive switching *(warm-up, not a major CAT metric)*.
3. **CALCULATE**: 5-question Smart Maths quiz.
   - *Purpose*: mental arithmetic, numerical fluency, calculation speed, mental activation.

### Why the Warm-up Exists
- **READ** → activate comprehension
- **THINK** → activate reasoning
- **CALCULATE** → activate numerical processing
- **THEN** → CAT PREPARATION

Transition: `normal daily state → focused study state`.

Completion state:
```
✓ Read
✓ Think
✓ Calculate

BRAIN WARMED UP
You're ready for today's preparation.
[ START TODAY'S PLAN ]
```

---

## 9. THE SYSTEM SHOULD BECOME ADAPTIVE

Recommendations transition from rule-based to evidence-based:

`USER DATA → PREPARATION STAGE → RECENT PERFORMANCE → WEAK AREAS → ERROR PATTERNS → TIME MANAGEMENT → MOCK PERFORMANCE → SELECT NEXT TASK`

The system answers: *"Why am I being asked to do this?"*  
Example:
> *"Today's Smart Maths: 2 questions selected from Number System. Why? Your accuracy in Number System has been below your recent average."*

---

## 10. LEARN

A structured CAT syllabus rather than a generic content library:

- **VARC**: Reading Comprehension, Verbal Ability
- **DILR**: Data Interpretation, Logical Reasoning
- **QA**: Arithmetic, Algebra, Geometry, Number System, Modern Mathematics

Each topic tracks a state:
- `Not Started`
- `Learning`
- `Practicing`
- `Strong`
- `Needs Revision`

Answers: *"Where am I in the syllabus?"* (without requiring manual bookkeeping).

---

## 11. PRACTICE & CONTEXT PRESERVATION

Practice is the bridge between learning and testing:
- Practice by Subject
- Practice by Topic
- Practice Weak Areas
- Practice PYQs
- Practice Mistakes

**Context Preservation Rule**: Clicking `Current Focus: DILR — Arrangements [Practice]` opens the practice engine pre-filtered to `CAT → DILR → Arrangements` with recommended difficulty and question count without redundant clicks.

---

## 12. PRACTICE MODE VS EXAM MODE

The same question infrastructure supports two distinct modes:

- **Practice Mode**: Immediate feedback (`Answer → Correct / Incorrect → Explanation → Concept → Related Question`).
- **Exam Mode**: No answer feedback until submission (`Question → Answer → Next → Submit → Analysis`).
- **Do not mix these experiences.**

---

## 13. QUESTION DNA

Every question carries structured metadata:
```json
{
  "exam": "CAT",
  "year": 2024,
  "section": "QA",
  "topic": "Arithmetic",
  "subtopic": "Time & Work",
  "difficulty": "Medium",
  "question_type": "MCQ",
  "source": "CAT 2024 Slot 2",
  "estimated_time": 120
}
```
Plus concept, skill, expected vs. actual time, error type, revision count.

---

## 14. DILR SHOULD BE SET-CENTRIC

Track:
- Set type, difficulty, time spent, questions attempted/correct, set selection, set completion.
- Diagnostic: *"You often select sets that consume significant time without sufficient returns."*

---

## 15. MOCKS & EXAM INTERFACE

Mocks are high-value diagnostic events:
- Full CAT Mocks (198 marks, 3 sections, 40 min each)
- Sectional Mocks (40 min, single section)
- Previous Year Papers

**During the mock**: Question, options, timer, navigation, mark for review, question palette. **Nothing else.** No intrusive analytics during the test.

---

## 16. MOCK ANALYSIS & TIME VS ACCURACY

After submission:
- Overall: Score, attempts, correct, incorrect, accuracy, time.
- Section-wise: VARC, DILR, QA.
- Question-level time vs accuracy analysis:
  - **Time Traps**: Disproportionate time with poor outcomes.
  - **High-Value Questions**: Accurate and fast.
  - **Slow-but-Accurate**: Speed improvement opportunity.
  - **Fast-but-Inaccurate**: Precision/trap issue.

---

## 17. MISTAKE NOTEBOOK & REVISION ENGINE

Central component. Every error is classified:
- `Conceptual`
- `Calculation`
- `Misread`
- `Wrong approach`
- `Silly mistake`
- `Time pressure`
- `Guess`
- `Question selection`

Identifies patterns: *"Your largest recurring issue is time pressure in Arithmetic. [Practice Targeted Questions]"*

**Spaced Repetition Revision Queue**:
`Wrong → Reviewed → Correct once → Correct again → Mastered`

---

## 18. PREPARATION READINESS

Avoid claiming precise CAT percentile predictions. Display trends:
- VARC: Improving
- DILR: Needs attention
- QA: Stable
- Revision: Improving

---

## 19. PREPARATION STAGES & DAILY PLAN ENGINE

- **Stage 1 — Foundation**: Concepts, basic questions, syllabus coverage
- **Stage 2 — Building**: Topic practice, mixed questions, increasing difficulty
- **Stage 3 — CAT-Level Practice**: Timed sets, PYQs, advanced questions, question selection
- **Stage 4 — Mock Intensive**: Full mocks, sectionals, analysis, time strategy
- **Stage 5 — Final Revision**: Mistakes, weak areas, high-frequency concepts, revision

Daily plan generated from:
`Stage + Available Time + Syllabus Progress + Weak Areas + Recent Performance + Mistake Backlog + Mock Schedule`

Realistic sizing: Never generate a 6-hour plan for a user specifying 2 hours/day.

---

## 20. UX DESIGN SYSTEM & MOBILE-FIRST PRINCIPLE

### Visual Characteristics
- Modern, minimal, academic, calm, spacious.
- High contrast, excellent typography, clear hierarchy, subtle motion.
- **Avoid**: Excessive gradients, neon UI, excessive glassmorphism, too many shadows, giant statistics, dense screens, excessive badges, competing colors.

### Mobile-First Principle
- Mobile is not merely a smaller desktop layout.
- Bottom navigation, large touch targets (min 44px), stacked cards, short content blocks, sticky actions, readable typography, instant access to today's plan.

---

## 21. FIRST-TIME USER EXPERIENCE

Short onboarding:
1. Welcome to ExamCraft. Let's set up your CAT preparation.
2. Preparation stage selection (Foundation, Building, CAT-level practice, Mock intensive).
3. Daily study time (`[ 1h ] [ 2h ] [ 3h ] [ Custom ]`).
4. Optional strengths/weaknesses.
5. `[ CREATE MY PLAN ]` → Land directly on daily command center.

---

## 22. AI INTEGRATION PRINCIPLES

- AI should **support the preparation loop** rather than be a generic chatbot bolted onto the website.
- **Avoid**: "Ask AI anything" everywhere.
- **Targeted capabilities**: Question explanations at different depths, mistake pattern diagnosis, adaptive question selection, CAT-style RC questions from reading material, realistic study plan generation, mock diagnostic synthesis.

---

## 23. NON-DESTRUCTIVE DEVELOPMENT RULE (Rule 38)

*CRITICAL FOR ANTIGRAVITY:*

Before modifying existing functionality:
1. Inspect existing architecture, routes, database schemas, API dependencies, shared components, test engine, analytics, and authentication dependencies.
2. Reuse existing infrastructure where possible.
3. **Do NOT**: drop database tables, delete question data, delete test data, rewrite working test functionality unnecessarily, remove shared components without checking dependencies, change schemas casually.
4. If a feature is no longer desired in learner UI: **Hide / deactivate it first.** Destructive deletion requires a separate explicit decision.

---

## 24. PHASED PRODUCT ROADMAP

- **Phase 1 — Simplify**: Make ExamCraft feel like a CAT product (CAT-only learner experience, simplified navigation: Home, Learn, Practice, Mocks, Analysis; secondary: My Goal, Settings, Profile; redesigned dashboard, mobile-first layout, hide unrelated exams & educator/admin from learner UI).
- **Phase 2 — Build the Daily Loop**: Daily Warm-up (AEON article, Sudoku/chess, Smart Maths), Today's CAT Plan, task completion, warm-up completion state, study streak.
- **Phase 3 — Build the Learning System**: Structured CAT syllabus, topic progress, learning states, topic practice, PYQ organization, practice by weakness.
- **Phase 4 — Build the Diagnostic System**: Detailed mock analysis, time vs accuracy, error classification, mistake notebook, weak-area identification, question-level analytics.
- **Phase 5 — Build the Revision System**: Revision queue, spaced repetition, mistake revision, weak-topic revision, mastery tracking.
- **Phase 6 — Build Adaptive Preparation**: Personalized daily plans, adaptive warm-up, adaptive Smart Maths, adaptive article selection, weak-area recommendations, performance-driven topic sequencing.
- **Phase 7 — Build Personal Coaching Intelligence**: Answering why score dropped, what mistakes repeat, what to revise, what next mock should focus on using actual learner data.

---

## 25. THE NORTH STAR & MASTER PRODUCT STATEMENT

> **"ExamCraft should know what the learner has done, understand where the learner is struggling, and turn that information into the next useful action."**

ExamCraft is not primarily a question bank, a mock-test platform, or an analytics dashboard.  
**It is a personalized preparation loop for CAT.** Everything else exists to strengthen that loop.

*Build the product so that the learner never has to wonder: "What should I do next?"*
