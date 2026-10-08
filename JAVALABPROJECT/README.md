# AI Interview Simulator & Placement Assessment Platform

An enterprise-grade Multiple Choice Question (MCQ) based Assessment and Placement Simulation Platform developed in 100% pure Java (JDK 21 LTS, Java Swing, Java Collections, and Java File I/O).

Simulates actual technical and recruitment assessment rounds for top IT service and product-based companies (**TCS NQT, Infosys, Wipro, Accenture, Cognizant, Capgemini**).

---

?## Key Highlights & Features

1. **860+ Curated Question Bank**:
   - **Aptitude**: 213 Questions (Percentages, Profit & Loss, Time & Work, Speed Distance, Interest, Probability, Clocks, etc.)
   - **Logical Reasoning**: 160 Questions (Syllogisms, Blood Relations, Coding-Decoding, Number/Alphabet Series, Direction Sense)
   - **Java Programming**: 210 Questions (OOP, Collections, Multithreading, Exceptions, Streams, Code Output Snippets)
   - **Database Management Systems (DBMS)**: 160 Questions (SQL Queries, Normalization 1NF-BCNF, ACID, Transactions, Indexing)
   - **CS Fundamentals**: 120 Questions (Operating Systems, Computer Networks, Data Structures, Algorithms)

2. **Adaptive Difficulty Engine**:
   - Assessment begins at **Easy** difficulty.
   - Transitions dynamically to **Medium** and **Hard** upon consecutive correct answers.
   - Automatically adapts downward upon incorrect answers.

3. **High-Stakes Assessment Screen**:
   - Real-time **30-second countdown timer** per question with visual color warnings (Green -> Yellow -> Red) and auto-advance upon timeout.
   - **Formatted monospace code snippet box** with line numbers and syntax styling for programming questions.
   - **Interactive Option Cards (A, B, C, D)** with keyboard shortcuts (`A`, `B`, `C`, `D`, `Space` for Skip, `Enter` for Submit).
   - **Negative Marking Scheme**: +1.0 for Correct, -0.25 for Incorrect, 0.0 for Skipped.

4. **Gamification & Candidate Progression**:
   - **XP Engine**: Dynamic experience points calculated based on score, accuracy, and difficulty level.
   - **Levels**: `Beginner` (0-499 XP) -> `Intermediate` (500-1499 XP) -> `Advanced` (1500-2999 XP) -> `Expert` (3000+ XP).
   - **Badges**: 'First Step', 'Speed Demon', 'Centurion', 'Streak Master', 'Domain Master'.
   - **Daily Challenge**: 5 mixed-domain questions refreshed daily with consecutive login streak tracking.

5. **Visual Analytics & Dashboard**:
   - Custom Java Swing 2D graphics renderers:
     - **Performance Donut Chart**: Visual distribution of Correct, Incorrect, and Skipped answers.
     - **Domain Comparison Bar Chart**: Side-by-side performance benchmarks across all 5 subject areas.
     - **Placement Percentile Calculatori**: Standardized percentile relative to placement eligibility benchmarks.

6. **Weak-Area Detection & Recommendation Engine**:
   - Analyzes low-accuracy topics across assessment history.
   - Produces targeted, actionable revision strategies and topic recommendations.

7. **Zero External Dependencies**:
   - Built entirely on standard Java libraries (`javax.swing`, `java.awt`, `java.io`, `java.util`).
   - Persistent pure-text file databases in `data/`: `questions.txt`, `users.txt`, `history.txt`.

---

## Default Login Credentials

| Username | Password | Role |
|---|---|---|
ep `admin` | `admin123` | Administrator / Test Candidate |
| `student` | `pass123` | Student / Candidate |

*New candidates can also register directly through the "Create New Candidate Account" dialog on the Login Screen.*

---

## How to Run

?### Option 1: One-Click Launch
Double-click or run:
``-cmd
run.bat
```
*(If classes are not compiled, `run.bat` automatically invokes `compile.bat` first).*

?### Option 2: Build and Launch
```cmd
compile_and_run.bat
```

?### Option 3: Manual Compilation & Execution
```cmd
# Compile all source files
javac -encoding UTF-8 -d bin src\\util\\*.java src\\model\\*.java src\\service\\*.java src\\gui\\*.java src\\main\\*.java src\\test\\*.java

# Launch Main Application
java -cp bin main.Main

# Run Automated Verification Test Suite
java -cp bin test.AssessmentSystemVerificationTest
```
