package model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Abstract parent class representing an interview session.
 * Demonstrates Abstraction and template design for subclasses.
 */
public abstract class Interview {
    protected Candidate candidate;
    protected String selectedDifficulty; // "Easy", "Medium", "Hard", or "Adaptive"
    protected String currentDifficulty;
    protected List<Question> questions;
    protected int currentIndex;
    protected InterviewSessionReport report;

    public Interview(Candidate candidate, String selectedDifficulty) {
        this.candidate = candidate;
        this.selectedDifficulty = selectedDifficulty;
        this.currentDifficulty = selectedDifficulty.equalsIgnoreCase("Adaptive") ? "Easy" : selectedDifficulty;
        this.questions = new ArrayList<>();
        this.currentIndex = 0;

        String recordId = "REC" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        this.report = new InterviewSessionReport(recordId, candidate.getUsername(), timestamp,
                getInterviewType(), selectedDifficulty);
    }

    // Abstract methods to be implemented by specialized subclasses
    public abstract String getInterviewType();
    public abstract int getPassingThreshold();
    public abstract void loadQuestions(List<Question> questionBank, int maxQuestions);

    /**
     * Checks if there are more questions remaining.
     */
    public boolean hasNextQuestion() {
        return currentIndex < questions.size();
    }

    /**
     * Returns current question in the sequence.
     */
    public Question getCurrentQuestion() {
        if (currentIndex >= 0 && currentIndex < questions.size()) {
            return questions.get(currentIndex);
        }
        return null;
    }

    /**
     * Advances to the next question.
     */
    public void moveToNextQuestion() {
        if (hasNextQuestion()) {
            currentIndex++;
        }
    }

    /**
     * Records evaluation for the current question.
     */
    public void recordAnswer(AnswerEvaluation eval) {
        if (eval != null) {
            report.addEvaluation(eval);
        }
    }

    /**
     * Handles dynamic difficulty progression when in Adaptive mode.
     * Easy -> Medium -> Hard based on real-time candidate score.
     */
    public void handleAdaptiveProgression(AnswerEvaluation lastEval, List<Question> fullBank) {
        if (!selectedDifficulty.equalsIgnoreCase("Adaptive")) {
            return;
        }

        // If score is high (>= 75%), escalate difficulty
        if (lastEval.getScore() >= 75) {
            if ("Easy".equalsIgnoreCase(currentDifficulty)) {
                currentDifficulty = "Medium";
            } else if ("Medium".equalsIgnoreCase(currentDifficulty)) {
                currentDifficulty = "Hard";
            }
        } else if (lastEval.getScore() < 50) { // If struggling, de-escalate to foundational
            if ("Hard".equalsIgnoreCase(currentDifficulty)) {
                currentDifficulty = "Medium";
            } else if ("Medium".equalsIgnoreCase(currentDifficulty)) {
                currentDifficulty = "Easy";
            }
        }

        // Dynamically adjust subsequent unattempted questions if available
        for (int i = currentIndex + 1; i < questions.size(); i++) {
            Question oldQ = questions.get(i);
            Question replacement = findQuestionByDifficulty(fullBank, oldQ.getCategory(), currentDifficulty, questions);
            if (replacement != null) {
                questions.set(i, replacement);
            }
        }
    }

    private Question findQuestionByDifficulty(List<Question> fullBank, String category, String difficulty, List<Question> existing) {
        for (Question q : fullBank) {
            if (q.getCategory().equalsIgnoreCase(category) &&
                q.getDifficulty().equalsIgnoreCase(difficulty) &&
                !existing.contains(q)) {
                return q;
            }
        }
        return null;
    }

    /**
     * Finalizes aggregates and recommendations for the completed interview.
     */
    public InterviewSessionReport finalizeReport() {
        report.computeAggregates();
        candidate.addReportToHistory(report);
        return report;
    }

    // Getters
    public Candidate getCandidate() { return candidate; }
    public String getSelectedDifficulty() { return selectedDifficulty; }
    public String getCurrentDifficulty() { return currentDifficulty; }
    public List<Question> getQuestions() { return questions; }
    public int getCurrentIndex() { return currentIndex; }
    public int getTotalQuestionsCount() { return questions.size(); }
    public InterviewSessionReport getReport() { return report; }
}
