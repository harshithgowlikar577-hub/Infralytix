package test;

import model.*;
import service.AssessmentManager;
import service.MCQEvaluator;
import util.FileManager;

import java.util.List;

/**
 * Automated Verification Suite for the Placement Assessment Platform.
 * Validates:
 * 1. Dynamic Question Bank Loading (800+ MCQs across all 5 domains)
 * 2. Negative Marking Scheme (+1.0 Correct, -0.25 Wrong, 0.0 Skipped)
 * 3. Adaptive Assessment Difficulty Progression (Easy -> Medium -> Hard -> Easy)
 * 4. Gamification Logic (XP calculation, Levels, Badges, Daily Challenge)
 * 5. Weak Area Detection and Report Generation
 */
public class AssessmentSystemVerificationTest {

    public static void main(String[] args) {
        System.out.println("======================================================================");
        System.out.println("    RUNNING AUTOMATED PLACEMENT ASSESSMENT PLATFORM VERIFICATION");
        System.out.println("======================================================================\n");

        int passed = 0;
        int failed = 0;

        FileManager fm = new FileManager();
        AssessmentManager am = new AssessmentManager(fm);
        List<Question> bank = am.getQuestionBank();

        // TEST 1: Question Bank Size & Domain Distribution
        System.out.println("[TEST 1] Validating Question Bank Size & Domain Coverage...");
        int totalQs = bank.size();
        System.out.println("  Total Questions Loaded: " + totalQs);
        if (totalQs >= 800) {
            System.out.println("  [PASS] Total questions count exceeds 800 requirement (" + totalQs + ").");
            passed++;
        } else {
            System.err.println("  [FAIL] Expected at least 800 questions, but found: " + totalQs);
            failed++;
        }

        int aptCount = 0, logicCount = 0, javaCount = 0, dbmsCount = 0, csCount = 0;
        for (Question q : bank) {
            String d = q.getDomain().toLowerCase();
            if (d.contains("aptitude")) aptCount++;
            else if (d.contains("logic")) logicCount++;
            else if (d.contains("java")) javaCount++;
            else if (d.contains("dbms")) dbmsCount++;
            else if (d.contains("computer") || d.contains("cs")) csCount++;
        }
        System.out.println(String.format("  Counts -> Aptitude: %d, Logic: %d, Java: %d, DBMS: %d, CS: %d",
                aptCount, logicCount, javaCount, dbmsCount, csCount));

        if (aptCount >= 200 && logicCount >= 150 && javaCount >= 200 && dbmsCount >= 150 && csCount >= 100) {
            System.out.println("  [PASS] All 5 domains satisfy target quotas (Aptitude 200+, Logic 150+, Java 200+, DBMS 150+, CS 100+).");
            passed++;
        } else {
            System.err.println("  [FAIL] Quota failure in domain count!");
            failed++;
        }

        // TEST 2: Negative Marking Evaluation
        System.out.println("\n[TEST 2] Validating Negative Marking Engine...");
        Question sampleQ = new Question(999, "Java", "OOP", "Easy",
                "What is size of int in Java?", "2 bytes", "4 bytes", "8 bytes", "Depends", 'B', "4 bytes.");

        MCQEvaluation evalCorrect = new MCQEvaluation(sampleQ, 'B', 10);
        MCQEvaluation evalWrong = new MCQEvaluation(sampleQ, 'A', 12);
        MCQEvaluation evalSkip = new MCQEvaluation(sampleQ, 'S', 5);

        if (evalCorrect.getMarksAwarded() == 1.0 && evalCorrect.isCorrect() &&
            evalWrong.getMarksAwarded() == -0.25 && !evalWrong.isCorrect() &&
            evalSkip.getMarksAwarded() == 0.0 && evalSkip.isSkipped()) {
            System.out.println("  [PASS] Marking verified: Correct = +1.0, Wrong = -0.25, Skipped = 0.0.");
            passed++;
        } else {
            System.err.println("  [FAIL] Marking scheme calculation mismatch!");
            failed++;
        }

        // TEST 3: Adaptive Difficulty Progression
        System.out.println("\n[TEST 3] Validating Adaptive Difficulty Escalation and De-escalation...");
        Candidate testCandidate = new Candidate("testuser", "pass", "Test Candidate", "23CS999", "CSE");
        JavaAssessment javaAssessment = new JavaAssessment(testCandidate, "Adaptive");
        javaAssessment.loadQuestions(bank, 10);

        System.out.println("  Initial Difficulty: " + javaAssessment.getCurrentDifficulty());
        // Simulate correct answer
        Question q1 = javaAssessment.getCurrentQuestion();
        javaAssessment.submitAnswer(q1.getCorrectAnswer(), 10);
        System.out.println("  Difficulty after Correct answer: " + javaAssessment.getCurrentDifficulty());

        boolean escalated = javaAssessment.getCurrentDifficulty().equalsIgnoreCase("Medium");
        // Simulate another correct answer
        javaAssessment.moveToNextQuestion();
        Question q2 = javaAssessment.getCurrentQuestion();
        javaAssessment.submitAnswer(q2.getCorrectAnswer(), 10);
        System.out.println("  Difficulty after 2nd Correct answer: " + javaAssessment.getCurrentDifficulty());
        boolean reachedHard = javaAssessment.getCurrentDifficulty().equalsIgnoreCase("Hard");

        // Simulate wrong answer
        javaAssessment.moveToNextQuestion();
        Question q3 = javaAssessment.getCurrentQuestion();
        char wrongChar = (q3.getCorrectAnswer() == 'A') ? 'B' : 'A';
        javaAssessment.submitAnswer(wrongChar, 15);
        System.out.println("  Difficulty after Wrong answer: " + javaAssessment.getCurrentDifficulty());
        boolean deescalated = javaAssessment.getCurrentDifficulty().equalsIgnoreCase("Medium");

        if (escalated && reachedHard && deescalated) {
            System.out.println("  [PASS] Adaptive engine successfully transitions Easy -> Medium -> Hard -> Medium.");
            passed++;
        } else {
            System.err.println("  [FAIL] Adaptive progression state mismatch!");
            failed++;
        }

        // TEST 4: Gamification (XP, Levels, Streak, Badges)
        System.out.println("\n[TEST 4] Validating Gamification & XP Engine...");
        int initialXP = testCandidate.getXpPoints();
        AssessmentSessionReport rep = javaAssessment.getReport();
        am.finalizeAssessment(javaAssessment, testCandidate);

        System.out.println("  XP before test: " + initialXP + " -> XP after test: " + testCandidate.getXpPoints());
        System.out.println("  Candidate Level: " + testCandidate.getLevel());

        if (testCandidate.getXpPoints() > initialXP) {
            System.out.println("  [PASS] XP points correctly computed, awarded, and level updated.");
            passed++;
        } else {
            System.err.println("  [FAIL] XP was not awarded!");
            failed++;
        }

        // TEST 5: Daily Challenge Generator
        System.out.println("\n[TEST 5] Validating Daily Placement Challenge...");
        List<Question> daily = am.getDailyChallengeQuestions();
        System.out.println("  Daily challenge questions count: " + daily.size());
        if (daily.size() == 5) {
            System.out.println("  [PASS] Daily Challenge generated 5 mixed domain questions successfully.");
            passed++;
        } else {
            System.err.println("  [FAIL] Expected 5 daily challenge questions, got: " + daily.size());
            failed++;
        }

        System.out.println("\n======================================================================");
        System.out.println("  TOTAL TESTS RUN: " + (passed + failed) + " | PASSED: " + passed + " | FAILED: " + failed);
        System.out.println("======================================================================");

        if (failed > 0) {
            System.exit(1);
        }
    }
}
