package model;

import java.util.ArrayList;
import java.util.List;

/**
 * Encapsulates the evaluation result of an individual question response.
 */
public class AnswerEvaluation {
    private Question question;
    private String candidateAnswer;
    private List<String> matchedKeywords;
    private List<String> missedKeywords;
    private int score; // 0 - 100
    private int timeTakenSeconds;
    private String feedback;

    public AnswerEvaluation(Question question, String candidateAnswer, List<String> matchedKeywords,
                            List<String> missedKeywords, int score, int timeTakenSeconds, String feedback) {
        this.question = question;
        this.candidateAnswer = candidateAnswer;
        this.matchedKeywords = (matchedKeywords != null) ? new ArrayList<>(matchedKeywords) : new ArrayList<>();
        this.missedKeywords = (missedKeywords != null) ? new ArrayList<>(missedKeywords) : new ArrayList<>();
        this.score = Math.max(0, Math.min(100, score));
        this.timeTakenSeconds = timeTakenSeconds;
        this.feedback = feedback;
    }

    public boolean isPassed() {
        return score >= 60;
    }

    // Getters and Setters
    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public String getCandidateAnswer() {
        return candidateAnswer;
    }

    public void setCandidateAnswer(String candidateAnswer) {
        this.candidateAnswer = candidateAnswer;
    }

    public List<String> getMatchedKeywords() {
        return matchedKeywords;
    }

    public void setMatchedKeywords(List<String> matchedKeywords) {
        this.matchedKeywords = matchedKeywords;
    }

    public List<String> getMissedKeywords() {
        return missedKeywords;
    }

    public void setMissedKeywords(List<String> missedKeywords) {
        this.missedKeywords = missedKeywords;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = Math.max(0, Math.min(100, score));
    }

    public int getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(int timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
