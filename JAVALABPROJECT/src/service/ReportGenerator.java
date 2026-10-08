package service;

import model.AssessmentSessionReport;
import model.Candidate;
import model.MCQEvaluation;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

/**
 * Generates formatted diagnostic placement assessment transcripts and reports.
 */
public class ReportGenerator {

    public String generateTextReport(AssessmentSessionReport report, Candidate candidate) {
        if (report == null) return "No report available.";

        StringBuilder sb = new StringBuilder();
        sb.append("========================================================================\n");
        sb.append("    AI PLACEMENT ASSESSMENT PLATFORM - OFFICIAL SCORECARD\n");
        sb.append("========================================================================\n\n");

        sb.append(String.format("%-20s: %s\n", "Assessment ID", report.getRecordId()));
        sb.append(String.format("%-20s: %s\n", "Candidate Name", candidate != null ? candidate.getName() : report.getUsername()));
        sb.append(String.format("%-20s: %s\n", "Roll Number", candidate != null ? candidate.getRollNumber() : "N/A"));
        sb.append(String.format("%-20s: %s\n", "Branch / College", candidate != null ? candidate.getBranch() : "N/A"));
        sb.append(String.format("%-20s: %s\n", "Assessment Domain", report.getDomain()));
        sb.append(String.format("%-20s: %s\n", "Difficulty Mode", report.getDifficultyMode()));
        sb.append(String.format("%-20s: %s\n", "Date & Time", report.getTimestamp()));
        sb.append("------------------------------------------------------------------------\n\n");

        sb.append("EXECUTIVE PERFORMANCE SUMMARY:\n");
        sb.append(String.format("  Total Questions        : %d\n", report.getTotalQuestions()));
        sb.append(String.format("  Correct Answers (+1.0) : %d\n", report.getCorrectCount()));
        sb.append(String.format("  Wrong Answers   (-0.25): %d\n", report.getWrongCount()));
        sb.append(String.format("  Skipped         (0.0)  : %d\n", report.getSkippedCount()));
        sb.append(String.format("  Net Score Earned       : %.2f / %.2f\n", report.getNetScore(), report.getMaxScore()));
        sb.append(String.format("  Score Percentage       : %d%%\n", report.getPercentage()));
        sb.append(String.format("  Accuracy Rate          : %.1f%%\n", report.getAccuracyPercentage()));
        sb.append(String.format("  Avg Time per Question  : %.1f seconds\n", report.getAverageTimeSeconds()));
        sb.append(String.format("  Placement Percentile   : %dth Percentile\n\n", report.getRankPercentile()));

        sb.append("STRONG DOMAIN TOPICS (>= 70% Accuracy):\n");
        if (report.getStrongAreas().isEmpty()) {
            sb.append("  None identified in this session.\n");
        } else {
            for (String s : report.getStrongAreas()) {
                sb.append("  [+] ").append(s).append("\n");
            }
        }
        sb.append("\n");

        sb.append("CRITICAL WEAK AREAS (< 50% Accuracy):\n");
        if (report.getWeakAreas().isEmpty()) {
            sb.append("  None identified! Great foundational command across all topics.\n");
        } else {
            for (String w : report.getWeakAreas()) {
                sb.append("  [-] ").append(w).append("\n");
            }
        }
        sb.append("\n");

        sb.append("PERSONALIZED PLACEMENT RECOMMENDATIONS:\n");
        for (String rec : report.getRecommendations()) {
            sb.append("  * ").append(rec).append("\n");
        }
        sb.append("\n");

        sb.append("========================================================================\n");
        sb.append("                      DETAILED QUESTION TRANSCRIPT\n");
        sb.append("========================================================================\n");

        int qNum = 1;
        for (MCQEvaluation eval : report.getEvaluations()) {
            sb.append(String.format("Q%d: %s\n", qNum++, eval.getQuestion().getFormattedQuestionText()));
            sb.append("    Your Choice   : ").append(eval.getCandidateAnswerText()).append("\n");
            sb.append("    Correct Answer: ").append(eval.getCorrectAnswerText()).append("\n");
            sb.append("    Marks Awarded : ").append(eval.getMarksAwarded() > 0 ? "+1.0" : String.valueOf(eval.getMarksAwarded())).append("\n");
            sb.append("    Time Spent    : ").append(eval.getTimeTakenSeconds()).append("s\n");
            sb.append("    Feedback      : ").append(eval.getFeedback()).append("\n\n");
        }

        return sb.toString();
    }

    public boolean exportReportToFile(File targetFile, AssessmentSessionReport report, Candidate candidate) {
        try (FileWriter fw = new FileWriter(targetFile)) {
            fw.write(generateTextReport(report, candidate));
            return true;
        } catch (IOException e) {
            System.err.println("Failed to export report: " + e.getMessage());
            return false;
        }
    }
}
