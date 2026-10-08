package service;

import model.AssessmentSessionReport;
import model.MCQEvaluation;
import model.Question;

/**
 * Common interface defining the contract for all placement assessment sessions.
 * Demonstrates Abstraction and loose coupling between GUI and business logic.
 */
public interface AssessmentSession {
    String getDomain();
    String getDifficultyMode();
    String getCurrentDifficulty();
    int getTotalQuestions();
    int getCurrentIndex();
    boolean hasNextQuestion();
    Question getCurrentQuestion();
    MCQEvaluation submitAnswer(char chosenOption, int timeTakenSeconds);
    MCQEvaluation skipQuestion(int timeTakenSeconds);
    void moveToNextQuestion();
    AssessmentSessionReport getReport();
    int getTimeLimitPerQuestion();
}
