package service;

import model.*;
import util.EmptyAnswerException;
import util.FileManager;
import util.FileReadException;

import java.util.List;

/**
 * InterviewManager orchestrates active interview sessions, manages runtime polymorphism,
 * evaluation, and adaptive transitions.
 */
public class InterviewManager {
    private FileManager fileManager;
    private Evaluator evaluator;
    private RecommendationEngine recommendationEngine;
    private ReportGenerator reportGenerator;

    private List<Question> questionBank;
    private Interview currentInterview;

    public InterviewManager(FileManager fileManager) {
        this.fileManager = fileManager;
        this.evaluator = new EvaluationEngine();
        this.recommendationEngine = new RecommendationEngine();
        this.reportGenerator = new ReportGenerator();
        loadQuestionBank();
    }

    public void loadQuestionBank() {
        try {
            this.questionBank = fileManager.loadQuestions();
        } catch (FileReadException e) {
            System.err.println("Warning: Falling back to default questions. " + e.getMessage());
            this.questionBank = fileManager.getDefaultQuestions();
        }
    }

    /**
     * Factory method instantiating polymorphic interview subclasses.
     * Demonstrates Runtime Polymorphism.
     */
    public Interview startInterview(Candidate candidate, String interviewType, String difficulty, int numQuestions) {
        Interview interview;

        switch (interviewType.toLowerCase()) {
            case "hr behavioral round":
            case "hr":
                interview = new HRInterview(candidate, difficulty);
                break;
            case "dbms technical round":
            case "dbms":
                interview = new DBMSInterview(candidate, difficulty);
                break;
            case "comprehensive mixed round":
            case "mixed":
                interview = new MixedInterview(candidate, difficulty);
                break;
            case "java technical round":
            case "java":
            default:
                interview = new JavaInterview(candidate, difficulty);
                break;
        }

        // Polymorphic call to load questions
        interview.loadQuestions(questionBank, numQuestions);
        this.currentInterview = interview;
        return interview;
    }

    /**
     * Evaluates current question response and adjusts adaptive difficulty.
     */
    public AnswerEvaluation submitAnswer(String answerText, int timeElapsedSeconds) throws EmptyAnswerException {
        if (currentInterview == null || !currentInterview.hasNextQuestion()) {
            return null;
        }

        Question currentQ = currentInterview.getCurrentQuestion();
        AnswerEvaluation evaluation = evaluator.evaluateAnswer(currentQ, answerText, timeElapsedSeconds);

        currentInterview.recordAnswer(evaluation);
        currentInterview.handleAdaptiveProgression(evaluation, questionBank);
        currentInterview.moveToNextQuestion();

        return evaluation;
    }

    /**
     * Handles skipped questions with 0 score.
     */
    public AnswerEvaluation skipCurrentQuestion() {
        if (currentInterview == null || !currentInterview.hasNextQuestion()) {
            return null;
        }

        Question currentQ = currentInterview.getCurrentQuestion();
        AnswerEvaluation evaluation = new AnswerEvaluation(
                currentQ,
                "[Question Skipped by Candidate]",
                List.of(),
                currentQ.getKeywords(),
                0,
                0,
                "Question was skipped without response."
        );

        currentInterview.recordAnswer(evaluation);
        currentInterview.moveToNextQuestion();
        return evaluation;
    }

    /**
     * Finalizes session report, generates personalized recommendations, and saves to file.
     */
    public InterviewSessionReport finishInterview() {
        if (currentInterview == null) {
            return null;
        }

        InterviewSessionReport report = currentInterview.finalizeReport();
        recommendationEngine.generateRecommendations(report);

        // Persist report to history.txt
        fileManager.appendHistory(report);

        return report;
    }

    // Getters
    public Interview getCurrentInterview() { return currentInterview; }
    public List<Question> getQuestionBank() { return questionBank; }
    public ReportGenerator getReportGenerator() { return reportGenerator; }
    public FileManager getFileManager() { return fileManager; }
}
