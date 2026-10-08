package model;

import java.io.Serializable;
import java.util.*;

/**
 * Encapsulates the complete performance report of a placement assessment session,
 * aggregating domain metrics, negative marking calculations, weak area detection,
 * and placement percentile rankings.
 */
public class AssessmentSessionReport implements Serializable {
    private static final long serialVersionUID = 1L;

    private String recordId;
    private String username;
    private String timestamp;
    private String domain;           // e.g. "Aptitude", "Java Programming", "TCS NQT Mock", etc.
    private String difficultyMode;   // "Easy", "Medium", "Hard", "Adaptive"
    private List<MCQEvaluation> evaluations;

    private int totalQuestions;
    private int correctCount;
    private int wrongCount;
    private int skippedCount;

    private double netScore;         // sum of marks (+1.0, -0.25, 0.0)
    private double maxScore;
    private int percentage;          // (netScore / maxScore) * 100 clamped >= 0
    private double accuracyPercentage; // (correct / (correct + wrong)) * 100
    private int totalTimeSeconds;
    private double averageTimeSeconds;

    private int rankPercentile;      // 0 - 99 placement readiness percentile
    private Map<String, int[]> topicMetrics; // topic -> [attempted, correct]
    private List<String> weakAreas;   // accuracy < 50%
    private List<String> strongAreas; // accuracy >= 75%
    private List<String> recommendations;

    private int xpEarned;
    private List<String> badgesUnlocked;

    public AssessmentSessionReport(String recordId, String username, String timestamp,
                                   String domain, String difficultyMode) {
        this.recordId = recordId;
        this.username = username;
        this.timestamp = timestamp;
        this.domain = domain;
        this.difficultyMode = difficultyMode;
        this.evaluations = new ArrayList<>();
        this.topicMetrics = new HashMap<>();
        this.weakAreas = new ArrayList<>();
        this.strongAreas = new ArrayList<>();
        this.recommendations = new ArrayList<>();
        this.badgesUnlocked = new ArrayList<>();
    }

    public void addEvaluation(MCQEvaluation eval) {
        if (eval != null) {
            evaluations.add(eval);
        }
    }

    /**
     * Aggregates all metrics with strict negative marking (+1.0, -0.25, 0).
     */
    public void computeAggregates() {
        this.totalQuestions = evaluations.size();
        if (totalQuestions == 0) {
            this.netScore = 0.0;
            this.maxScore = 0.0;
            this.percentage = 0;
            this.accuracyPercentage = 0.0;
            return;
        }

        this.correctCount = 0;
        this.wrongCount = 0;
        this.skippedCount = 0;
        double sumMarks = 0.0;
        int timeSum = 0;

        topicMetrics.clear();

        for (MCQEvaluation eval : evaluations) {
            sumMarks += eval.getMarksAwarded();
            timeSum += eval.getTimeTakenSeconds();

            if (eval.isCorrect()) {
                correctCount++;
            } else if (eval.isSkipped()) {
                skippedCount++;
            } else {
                wrongCount++;
            }

            // Track topic metrics for weak area detection
            String topic = eval.getQuestion().getTopic();
            if (topic == null || topic.isEmpty()) topic = "General";
            int[] counts = topicMetrics.computeIfAbsent(topic, k -> new int[2]);
            counts[0]++; // attempted
            if (eval.isCorrect()) {
                counts[1]++; // correct
            }
        }

        this.netScore = Math.max(0.0, Math.round(sumMarks * 100.0) / 100.0);
        this.maxScore = totalQuestions * 1.0;
        this.percentage = (int) Math.round((netScore / maxScore) * 100.0);

        int attemptedQuestions = correctCount + wrongCount;
        this.accuracyPercentage = (attemptedQuestions > 0) ?
                Math.round(((double) correctCount / attemptedQuestions) * 1000.0) / 10.0 : 0.0;

        this.totalTimeSeconds = timeSum;
        this.averageTimeSeconds = (totalQuestions > 0) ?
                Math.round(((double) timeSum / totalQuestions) * 10.0) / 10.0 : 0.0;

        // Calculate placement percentile benchmark
        calculatePlacementPercentile();

        // Detect Strong and Weak areas
        detectStrengthsAndWeaknesses();
    }

    private void calculatePlacementPercentile() {
        if (percentage >= 90) {
            this.rankPercentile = 96 + (int) ((percentage - 90) * 0.3);
        } else if (percentage >= 75) {
            this.rankPercentile = 85 + (int) ((percentage - 75) * 0.7);
        } else if (percentage >= 60) {
            this.rankPercentile = 65 + (int) ((percentage - 60) * 1.3);
        } else if (percentage >= 45) {
            this.rankPercentile = 40 + (int) ((percentage - 45) * 1.6);
        } else {
            this.rankPercentile = Math.max(10, (int) (percentage * 0.8));
        }
    }

    private void detectStrengthsAndWeaknesses() {
        weakAreas.clear();
        strongAreas.clear();

        for (Map.Entry<String, int[]> entry : topicMetrics.entrySet()) {
            String topic = entry.getKey();
            int attempted = entry.getValue()[0];
            int correct = entry.getValue()[1];
            double acc = (attempted > 0) ? ((double) correct / attempted) * 100.0 : 0.0;

            if (acc >= 70.0) {
                strongAreas.add(topic + " (" + (int) acc + "% accuracy)");
            } else if (acc < 50.0) {
                weakAreas.add(topic + " (" + (int) acc + "% accuracy)");
            }
        }
    }

    public String toHistoryLine() {
        String weakJoined = weakAreas.isEmpty() ? "None" : String.join(";", weakAreas);
        return recordId + "|" + username + "|" + timestamp + "|" + domain + "|" +
                difficultyMode + "|" + percentage + "|" + totalQuestions + "|" +
                correctCount + "|" + wrongCount + "|" + netScore + "|" + weakJoined;
    }

    // Getters and Setters
    public String getRecordId() { return recordId; }
    public String getUsername() { return username; }
    public String getTimestamp() { return timestamp; }
    public String getDomain() { return domain; }
    public String getDifficultyMode() { return difficultyMode; }
    public List<MCQEvaluation> getEvaluations() { return evaluations; }
    public int getTotalQuestions() { return totalQuestions; }
    public int getCorrectCount() { return correctCount; }
    public int getWrongCount() { return wrongCount; }
    public int getSkippedCount() { return skippedCount; }
    public double getNetScore() { return netScore; }
    public double getMaxScore() { return maxScore; }
    public int getPercentage() { return percentage; }
    public double getAccuracyPercentage() { return accuracyPercentage; }
    public int getTotalTimeSeconds() { return totalTimeSeconds; }
    public double getAverageTimeSeconds() { return averageTimeSeconds; }
    public int getRankPercentile() { return rankPercentile; }
    public Map<String, int[]> getTopicMetrics() { return topicMetrics; }
    public List<String> getWeakAreas() { return weakAreas; }
    public List<String> getStrongAreas() { return strongAreas; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    public int getXpEarned() { return xpEarned; }
    public void setXpEarned(int xpEarned) { this.xpEarned = xpEarned; }
    public List<String> getBadgesUnlocked() { return badgesUnlocked; }
    public void setBadgesUnlocked(List<String> badgesUnlocked) { this.badgesUnlocked = badgesUnlocked; }
    // Standard getters mandated by Assessment Model architecture
    public double getPercentageScore() { return (double) percentage; }
    public double getPlacementPercentile() { return (double) rankPercentile; }
    public int getCorrectAnswers() { return correctCount; }
    public int getWrongAnswers() { return wrongCount; }
    public int getSkippedAnswers() { return skippedCount; }
    public double getScore() { return netScore; }
    public String getCompletionTime() {
        int minutes = totalTimeSeconds / 60;
        int seconds = totalTimeSeconds % 60;
        return String.format("%02d:%02d", minutes, seconds);
    }
    public int getCompletionTimeSeconds() { return totalTimeSeconds; }
    public void setDomain(String domain) { this.domain = domain; }
    public void setScore(double score) { this.netScore = score; }
    public void setPercentageScore(int percentageScore) { this.percentage = percentageScore; }
    public void setPlacementPercentile(int percentile) { this.rankPercentile = percentile; }
}
