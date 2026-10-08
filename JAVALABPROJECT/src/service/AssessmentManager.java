package service;

import model.*;
import util.FileManager;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Controller Service that coordinates questions, assessment factory,
 * evaluation pipeline, gamification, and file persistence.
 */
public class AssessmentManager {

    private FileManager fileManager;
    private GamificationManager gamificationManager;
    private RecommendationEngine recommendationEngine;
    private ReportGenerator reportGenerator;
    private List<Question> questionBank;

    public AssessmentManager(FileManager fileManager) {
        this.fileManager = fileManager;
        this.gamificationManager = new GamificationManager();
        this.recommendationEngine = new RecommendationEngine();
        this.reportGenerator = new ReportGenerator();
        this.questionBank = fileManager.loadQuestions();
    }

    /**
     * Factory method creating domain assessment sessions.
     */
    public Assessment createAssessment(Candidate candidate, String domain, String difficulty, int numQuestions) {
        Assessment assessment;

        if (domain.equalsIgnoreCase("Aptitude")) {
            assessment = new AptitudeAssessment(candidate, difficulty);
        } else if (domain.equalsIgnoreCase("Logical Reasoning")) {
            assessment = new LogicalReasoningAssessment(candidate, difficulty);
        } else if (domain.equalsIgnoreCase("Java Programming") || domain.equalsIgnoreCase("Java")) {
            assessment = new JavaAssessment(candidate, difficulty);
        } else if (domain.equalsIgnoreCase("DBMS")) {
            assessment = new DBMSAssessment(candidate, difficulty);
        } else if (domain.equalsIgnoreCase("Computer Science Fundamentals") || domain.equalsIgnoreCase("CS Fundamentals")) {
            assessment = new CSFundamentalsAssessment(candidate, difficulty);
        } else if (domain.startsWith("Company:")) {
            String company = domain.substring("Company:".length()).trim();
            assessment = new CompanyMockAssessment(candidate, company, difficulty);
        } else {
            assessment = new CompanyMockAssessment(candidate, domain, difficulty);
        }

        assessment.loadQuestions(questionBank, numQuestions);
        return assessment;
    }

    /**
     * Finalizes assessment report, awards XP, checks badges, and persists to history.txt and users.txt.
     */
    public AssessmentSessionReport finalizeAssessment(Assessment assessment, Candidate candidate) {
        AssessmentSessionReport report = assessment.getReport();

        // 1. Recommendations
        recommendationEngine.generateRecommendations(report, candidate);

        // 2. Gamification (XP, level, badges, streak)
        gamificationManager.processSessionGamification(candidate, report);

        // 3. Attach report to candidate history
        candidate.addReportToHistory(report);

        // 4. Persist to history.txt and update users.txt
        fileManager.appendHistory(report);
        fileManager.updateUser(candidate);

        return report;
    }

    public List<Question> getDailyChallengeQuestions() {
        return gamificationManager.generateDailyChallenge(questionBank);
    }

    // ---- MANDATORY ARCHITECTURAL LIFECYCLE METHODS ----
    public List<Question> getAllQuestions() {
        if (questionBank == null || questionBank.isEmpty()) {
            loadQuestions();
        }
        return questionBank != null ? questionBank : new ArrayList<>();
    }

    public void startAssessment(Assessment assessment) {
        startAssessment(assessment, getAllQuestions());
    }

    public void startAssessment(Assessment assessment, List<Question> questions) {
        if (assessment != null) {
            List<Question> bank = (questions != null && !questions.isEmpty()) ? questions : getAllQuestions();
            assessment.loadQuestions(bank, 10);
        }
    }

    public void startAssessmentFromList(Assessment assessment, List<Question> questionList) {
        if (assessment != null && questionList != null) {
            assessment.setQuestions(questionList);
        }
    }

    public List<Question> loadQuestions() {
        this.questionBank = fileManager.loadQuestions();
        return this.questionBank;
    }

    public AssessmentSessionReport saveResults(Assessment assessment, Candidate candidate) {
        return finalizeAssessment(assessment, candidate);
    }

    public void saveResults(AssessmentSessionReport report, Candidate candidate) {
        if (report != null && candidate != null) {
            candidate.addReportToHistory(report);
            fileManager.appendHistory(report);
            fileManager.updateUser(candidate);
        }
    }

    public Map<String, Object> generateAnalytics(Candidate candidate) {
        Map<String, Object> stats = new HashMap<>();
        if (candidate == null) return stats;
        List<AssessmentSessionReport> history = candidate.getAssessmentHistory();
        stats.put("totalTests", history.size());
        stats.put("averageScore", candidate.getAverageScore());
        stats.put("bestScore", candidate.getBestScore());
        stats.put("xp", candidate.getXpPoints());
        stats.put("level", candidate.getLevel());
        stats.put("streak", candidate.getStreakCount());
        stats.put("badges", candidate.getUnlockedBadges());
        return stats;
    }

    public List<Question> getQuestionBank() { return questionBank; }
    public FileManager getFileManager() { return fileManager; }
    public GamificationManager getGamificationManager() { return gamificationManager; }
    public RecommendationEngine getRecommendationEngine() { return recommendationEngine; }
    public ReportGenerator getReportGenerator() { return reportGenerator; }
}
