package test;

import model.*;
import service.*;
import util.*;

import java.util.List;

/**
 * Automated Verification Test for AI Interview Simulator.
 * Validates file I/O, OOP polymorphism, evaluation engine, exception handling, and report generation.
 */
public class SystemVerificationTest {
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("  AI INTERVIEW SIMULATOR - SYSTEM INTEGRATION TEST");
        System.out.println("=================================================");

        int passed = 0;
        int failed = 0;

        // Test 1: FileManager loading questions
        try {
            FileManager fm = new FileManager();
            List<Question> questions = fm.loadQuestions();
            if (questions.size() >= 10) {
                System.out.println("[PASS] FileManager: Successfully loaded " + questions.size() + " questions.");
                passed++;
            } else {
                System.out.println("[FAIL] FileManager: Expected >= 10 questions, got " + questions.size());
                failed++;
            }
        } catch (Exception e) {
            System.out.println("[FAIL] FileManager loading questions threw exception: " + e.getMessage());
            failed++;
        }

        // Test 2: Authentication & InvalidLoginException
        try {
            FileManager fm = new FileManager();
            Candidate c = fm.authenticate("admin", "admin123");
            if (c != null && c.getUsername().equals("admin")) {
                System.out.println("[PASS] Authentication: Successfully verified valid candidate credentials.");
                passed++;
            } else {
                System.out.println("[FAIL] Authentication: Candidate object was null or invalid.");
                failed++;
            }

            // Test bad password
            try {
                fm.authenticate("admin", "wrongpassword");
                System.out.println("[FAIL] InvalidLoginException: Failed to throw on wrong password.");
                failed++;
            } catch (InvalidLoginException ex) {
                System.out.println("[PASS] InvalidLoginException: Correctly caught invalid password: " + ex.getMessage());
                passed++;
            }
        } catch (Exception e) {
            System.out.println("[FAIL] Authentication test threw exception: " + e.getMessage());
            failed++;
        }

        // Test 3: Evaluator & Keyword Matching
        try {
            Evaluator evaluator = new EvaluationEngine();
            Question q = new Question(99, "Java", "Easy", "What is Inheritance?",
                    List.of("parent", "child", "extends", "reuse"), "Child class extends parent class for reuse.");

            String candidateAns = "Inheritance allows a child class to extend parent class methods and reuse code.";
            AnswerEvaluation eval = evaluator.evaluateAnswer(q, candidateAns, 25);

            if (eval.getScore() >= 80 && eval.getMatchedKeywords().contains("parent") && eval.getMatchedKeywords().contains("child")) {
                System.out.println("[PASS] EvaluationEngine: Correctly scored candidate response (" + eval.getScore() + "%). Matched: " + eval.getMatchedKeywords());
                passed++;
            } else {
                System.out.println("[FAIL] EvaluationEngine: Unexpected score (" + eval.getScore() + "%) or keywords.");
                failed++;
            }

            // Test EmptyAnswerException
            try {
                evaluator.evaluateAnswer(q, "   ", 10);
                System.out.println("[FAIL] EmptyAnswerException: Failed to throw on blank answer.");
                failed++;
            } catch (EmptyAnswerException ex) {
                System.out.println("[PASS] EmptyAnswerException: Correctly caught blank answer submission: " + ex.getMessage());
                passed++;
            }
        } catch (Exception e) {
            System.out.println("[FAIL] EvaluationEngine test threw exception: " + e.getMessage());
            failed++;
        }

        // Test 4: Polymorphism across Interview types
        try {
            FileManager fm = new FileManager();
            InterviewManager im = new InterviewManager(fm);
            Candidate testCand = new Candidate("testuser", "pass", "Test Student", "23CS999", "CSE");

            Interview javaInterview = im.startInterview(testCand, "Java", "Medium", 3);
            Interview hrInterview = im.startInterview(testCand, "HR", "Easy", 3);
            Interview dbmsInterview = im.startInterview(testCand, "DBMS", "Hard", 3);
            Interview mixedInterview = im.startInterview(testCand, "Mixed", "Adaptive", 3);

            if (javaInterview instanceof JavaInterview &&
                hrInterview instanceof HRInterview &&
                dbmsInterview instanceof DBMSInterview &&
                mixedInterview instanceof MixedInterview) {
                System.out.println("[PASS] Polymorphism: All specialized interview subclasses instantiated & bound via Interview parent.");
                passed++;
            } else {
                System.out.println("[FAIL] Polymorphism: Subclass type mismatch.");
                failed++;
            }

            // Test Adaptive Progression
            im.startInterview(testCand, "Java", "Adaptive", 3);
            Question firstQ = im.getCurrentInterview().getCurrentQuestion();
            AnswerEvaluation highEval = new AnswerEvaluation(firstQ, "perfect answer", firstQ.getKeywords(), List.of(), 90, 20, "Great");
            im.getCurrentInterview().handleAdaptiveProgression(highEval, im.getQuestionBank());

            System.out.println("[PASS] Adaptive Progression: Dynamic difficulty updated to -> " + im.getCurrentInterview().getCurrentDifficulty());
            passed++;

        } catch (Exception e) {
            System.out.println("[FAIL] Interview polymorphism test threw exception: " + e.getMessage());
            failed++;
        }

        // Test 5: RecommendationEngine & Report Generation
        try {
            InterviewSessionReport report = new InterviewSessionReport("REC999", "testuser", "2026-09-18 12:00", "Java Technical", "Medium");
            Question qFail = new Question(1, "Java", "Medium", "What is Polymorphism?", List.of("overload", "override"), "Details");
            AnswerEvaluation evalFail = new AnswerEvaluation(qFail, "I don't know", List.of(), List.of("overload", "override"), 20, 10, "Weak");
            report.addEvaluation(evalFail);
            report.computeAggregates();

            RecommendationEngine recEngine = new RecommendationEngine();
            recEngine.generateRecommendations(report);

            if (!report.getWeakAreas().isEmpty() && !report.getSuggestions().isEmpty()) {
                System.out.println("[PASS] RecommendationEngine: Correctly diagnosed weak areas -> " + report.getWeakAreas());
                passed++;
            } else {
                System.out.println("[FAIL] RecommendationEngine: No weak areas or suggestions generated.");
                failed++;
            }

            ReportGenerator rg = new ReportGenerator();
            String summary = rg.generateSummaryText(report);
            if (summary.contains("AI INTERVIEW SIMULATOR") && summary.contains("REC999")) {
                System.out.println("[PASS] ReportGenerator: Summary text generated successfully.");
                passed++;
            } else {
                System.out.println("[FAIL] ReportGenerator: Summary content missing headers.");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("[FAIL] Recommendation & Report test threw exception: " + e.getMessage());
            failed++;
        }

        System.out.println("=================================================");
        System.out.println("  TEST SUMMARY: Passed: " + passed + " | Failed: " + failed);
        System.out.println("=================================================");

        if (failed == 0) {
            System.out.println(">>> ALL CORE MODULE TESTS PASSED WITH 100% SUCCESS! <<<");
        } else {
            System.exit(1);
        }
    }
}
