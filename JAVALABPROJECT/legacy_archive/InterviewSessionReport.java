package model;

import java.util.*;

/**
 * Encapsulates the complete report of an interview session,
 * aggregating category metrics, weak areas, and score computations.
 */
public class InterviewSessionReport {
    private String recordId;
    private String username;
    private String timestamp;
    private String interviewType;
    private String difficultyMode;
    private List<AnswerEvaluation> evaluations;
    private int totalQuestions;
    private int correctAnswers;
    private int totalScorePercentage;
    private Map<String, Integer> categoryScores;
    private List<String> weakAreas;
    private List<String> suggestions;

    public InterviewSessionReport(String recordId, String username, String timestamp,
                                  String interviewType, String difficultyMode) {
        this.recordId = recordId;
        this.username = username;
        this.timestamp = timestamp;
        this.interviewType = interviewType;
        this.difficultyMode = difficultyMode;
        this.evaluations = new ArrayList<>();
        this.categoryScores = new HashMap<>();
        this.weakAreas = new ArrayList<>();
        this.suggestions = new ArrayList<>();
    }

    public void addEvaluation(AnswerEvaluation eval) {
        evaluations.add(eval);
    }

    /**
     * Computes aggregate metrics from all AnswerEvaluations.
     */
    public void computeAggregates() {
        this.totalQuestions = evaluations.size();
        if (totalQuestions == 0) {
            this.totalScorePercentage = 0;
            this.correctAnswers = 0;
            return;
        }

        int totalSum = 0;
        int correct = 0;
        Map<String, Integer> catSum = new HashMap<>();
        Map<String, Integer> catCount = new HashMap<>();

        for (AnswerEvaluation eval : evaluations) {
            int score = eval.getScore();
            totalSum += score;
            if (eval.isPassed()) {
                correct++;
            }

            String cat = eval.getQuestion().getCategory();
            catSum.put(cat, catSum.getOrDefault(cat, 0) + score);
            catCount.put(cat, catCount.getOrDefault(cat, 0) + 1);
        }

        this.correctAnswers = correct;
        this.totalScorePercentage = Math.round((float) totalSum / totalQuestions);

        categoryScores.clear();
        for (String cat : catSum.keySet()) {
            int count = catCount.get(cat);
            int avg = Math.round((float) catSum.get(cat) / count);
            categoryScores.put(cat, avg);
        }
    }

    // Pipe-delimited serialization for history.txt
    // Format: recordId|username|timestamp|interviewType|difficulty|scorePercentage|totalQuestions|correctAnswers|weakAreas
    public String toHistoryLine() {
        String weak = (weakAreas.isEmpty()) ? "None" : String.join("; ", weakAreas);
        return recordId + "|" + username + "|" + timestamp + "|" + interviewType + "|" +
                difficultyMode + "|" + totalScorePercentage + "|" + totalQuestions + "|" +
                correctAnswers + "|" + weak;
    }

    // Getters and Setters
    public String getRecordId() { return recordId; }
    public void setRecordId(String recordId) { this.recordId = recordId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public String getDifficultyMode() { return difficultyMode; }
    public void setDifficultyMode(String difficultyMode) { this.difficultyMode = difficultyMode; }

    public List<AnswerEvaluation> getEvaluations() { return evaluations; }
    public void setEvaluations(List<AnswerEvaluation> evaluations) { this.evaluations = evaluations; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public int getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }

    public int getTotalScorePercentage() { return totalScorePercentage; }
    public void setTotalScorePercentage(int totalScorePercentage) { this.totalScorePercentage = totalScorePercentage; }

    public Map<String, Integer> getCategoryScores() { return categoryScores; }
    public void setCategoryScores(Map<String, Integer> categoryScores) { this.categoryScores = categoryScores; }

    public List<String> getWeakAreas() { return weakAreas; }
    public void setWeakAreas(List<String> weakAreas) { this.weakAreas = weakAreas; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
}
