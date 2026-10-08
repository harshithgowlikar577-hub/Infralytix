package model;

import service.AssessmentSession;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Abstract base class representing an MCQ placement assessment session.
 * Demonstrates Abstraction, Template Method pattern, and dynamic Adaptive progression.
 */
public abstract class Assessment implements AssessmentSession {

    public static final int DEFAULT_TIME_LIMIT_SECONDS = 30; // 30 seconds per question

    protected Candidate candidate;
    protected String selectedDifficulty; // "Easy", "Medium", "Hard", or "Adaptive"
    protected String currentDifficulty;
    protected List<Question> questions;
    protected int currentIndex;
    protected AssessmentSessionReport report;
    protected List<Question> candidateQuestionPool;
    protected int consecutiveCorrectStreak;
    protected int consecutiveWrongStreak;
    protected boolean isDailyChallenge = false;

    public Assessment() {
        this(null, "Adaptive");
    }

    public Assessment(Candidate candidate, String selectedDifficulty) {
        this.candidate = candidate;
        this.selectedDifficulty = (selectedDifficulty != null) ? selectedDifficulty : "Adaptive";
        this.currentDifficulty = this.selectedDifficulty.equalsIgnoreCase("Adaptive") ? "Easy" : this.selectedDifficulty;
        this.questions = new ArrayList<>();
        this.currentIndex = 0;
        this.candidateQuestionPool = new ArrayList<>();
        this.consecutiveCorrectStreak = 0;
        this.consecutiveWrongStreak = 0;

        String recordId = "ASM" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        String uname = (candidate != null) ? candidate.getUsername() : "Guest";
        this.report = new AssessmentSessionReport(recordId, uname, timestamp,
                getDomain(), selectedDifficulty);
    }

    public boolean isDailyChallenge() {
        return isDailyChallenge;
    }

    public void setDailyChallenge(boolean isDailyChallenge) {
        this.isDailyChallenge = isDailyChallenge;
        if (isDailyChallenge && report != null) {
            report.setDomain(getDomain() + " (Daily Challenge)");
        }
    }

    public void setQuestions(List<Question> customQuestions) {
        this.questions = new ArrayList<>(customQuestions);
        this.candidateQuestionPool = new ArrayList<>(customQuestions);
        this.currentIndex = 0;
    }

    // Abstract methods to be specialized by domain subclasses
    @Override
    public abstract String getDomain();

    public abstract void loadQuestions(List<Question> questionBank, int maxQuestions);

    @Override
    public String getDifficultyMode() {
        return selectedDifficulty;
    }

    @Override
    public String getCurrentDifficulty() {
        return currentDifficulty;
    }

    @Override
    public int getTotalQuestions() {
        return questions.size();
    }

    @Override
    public int getCurrentIndex() {
        return currentIndex;
    }

    @Override
    public boolean hasNextQuestion() {
        return currentIndex < questions.size();
    }

    @Override
    public Question getCurrentQuestion() {
        if (currentIndex >= 0 && currentIndex < questions.size()) {
            return questions.get(currentIndex);
        }
        return null;
    }

    @Override
    public void moveToNextQuestion() {
        if (hasNextQuestion()) {
            currentIndex++;
        }
    }

    @Override
    public MCQEvaluation submitAnswer(char chosenOption, int timeTakenSeconds) {
        Question current = getCurrentQuestion();
        if (current == null) return null;

        MCQEvaluation eval = new MCQEvaluation(current, chosenOption, timeTakenSeconds);
        report.addEvaluation(eval);

        if (eval.isCorrect()) {
            consecutiveCorrectStreak++;
            consecutiveWrongStreak = 0;
        } else {
            consecutiveWrongStreak++;
            consecutiveCorrectStreak = 0;
        }

        // Apply adaptive difficulty adjustment if in Adaptive mode
        if (selectedDifficulty.equalsIgnoreCase("Adaptive")) {
            handleAdaptiveProgression(eval.isCorrect());
        }

        return eval;
    }

    @Override
    public MCQEvaluation skipQuestion(int timeTakenSeconds) {
        return submitAnswer('S', timeTakenSeconds);
    }

    /**
     * Adaptive progression logic:
     * If user answers correctly: Easy -> Medium -> Hard.
     * If user answers incorrectly: Hard -> Medium -> Easy.
     * Dynamically adjusts remaining questions in test queue from the question bank!
     */
    protected void handleAdaptiveProgression(boolean isCorrect) {
        String oldDifficulty = currentDifficulty;

        if (isCorrect) {
            if ("Easy".equalsIgnoreCase(currentDifficulty)) {
                currentDifficulty = "Medium";
            } else if ("Medium".equalsIgnoreCase(currentDifficulty)) {
                currentDifficulty = "Hard";
            }
        } else {
            if ("Hard".equalsIgnoreCase(currentDifficulty)) {
                currentDifficulty = "Medium";
            } else if ("Medium".equalsIgnoreCase(currentDifficulty)) {
                currentDifficulty = "Easy";
            }
        }

        // If difficulty changed, swap subsequent unattempted questions with matching difficulty from pool
        if (!oldDifficulty.equalsIgnoreCase(currentDifficulty) && currentIndex + 1 < questions.size()) {
            adaptFutureQuestions();
        }
    }

    private void adaptFutureQuestions() {
        Set<Integer> usedIds = new HashSet<>();
        for (Question q : questions) {
            usedIds.add(q.getQuestionId());
        }

        for (int i = currentIndex + 1; i < questions.size(); i++) {
            Question current = questions.get(i);
            if (!current.getDifficulty().equalsIgnoreCase(currentDifficulty)) {
                // Find a replacement question of the new target difficulty
                for (Question poolQ : candidateQuestionPool) {
                    if (!usedIds.contains(poolQ.getQuestionId()) &&
                        poolQ.getDifficulty().equalsIgnoreCase(currentDifficulty)) {
                        questions.set(i, poolQ);
                        usedIds.add(poolQ.getQuestionId());
                        break;
                    }
                }
            }
        }
    }

    @Override
    public AssessmentSessionReport getReport() {
        report.computeAggregates();
        return report;
    }

    @Override
    public int getTimeLimitPerQuestion() {
        return DEFAULT_TIME_LIMIT_SECONDS;
    }

    public List<Question> getQuestions() {
        return questions;
    }
}
