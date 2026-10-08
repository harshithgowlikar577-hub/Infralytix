package service;

import model.AssessmentSessionReport;
import model.Candidate;
import model.Question;

import java.time.LocalDate;
import java.util.*;

/**
 * Gamification Management Service.
 * Manages XP scoring, levels, dynamic badge unlocking, daily streak counters,
 * and daily placement challenge generation.
 */
public class GamificationManager {

    public static final String BADGE_SPEED_DEMON = "Speed Demon";
    public static final String BADGE_PERFECTIONIST = "Perfectionist";
    public static final String BADGE_JAVA_MAESTRO = "Java Maestro";
    public static final String BADGE_APTITUDE_ACE = "Aptitude Ace";
    public static final String BADGE_LOGIC_MASTER = "Logic Master";
    public static final String BADGE_STREAK_LEGEND = "Streak Legend";
    public static final String BADGE_PLACEMENT_READY = "Placement Ready";

    /**
     * Calculates XP gained from an assessment session and updates the Candidate.
     */
    public int processSessionGamification(Candidate candidate, AssessmentSessionReport report) {
        if (candidate == null || report == null) return 0;

        // Base XP: +10 per correct answer, -2 per wrong answer, +20 completion bonus
        int xpGained = (report.getCorrectCount() * 10) - (report.getWrongCount() * 2) + 20;

        // Accuracy bonus
        if (report.getAccuracyPercentage() >= 80.0) {
            xpGained += 25;
        }

        // Daily streak bonus
        candidate.checkAndIncrementStreak();
        if (candidate.getStreakCount() >= 3) {
            xpGained += (candidate.getStreakCount() * 5);
        }

        xpGained = Math.max(10, xpGained); // at least 10 XP for attempting
        candidate.addXP(xpGained);
        report.setXpEarned(xpGained);

        // Check badge unlocks
        List<String> newBadges = checkAndUnlockBadges(candidate, report);
        report.setBadgesUnlocked(newBadges);

        return xpGained;
    }

    private List<String> checkAndUnlockBadges(Candidate candidate, AssessmentSessionReport report) {
        List<String> unlockedNow = new ArrayList<>();
        Set<String> existing = candidate.getUnlockedBadges();

        // 1. Speed Demon: average time < 12 seconds with accuracy >= 75%
        if (!existing.contains(BADGE_SPEED_DEMON) &&
            report.getAverageTimeSeconds() <= 12.0 && report.getAccuracyPercentage() >= 75.0) {
            existing.add(BADGE_SPEED_DEMON);
            unlockedNow.add(BADGE_SPEED_DEMON);
        }

        // 2. Perfectionist: 100% score on a test with >= 5 questions
        if (!existing.contains(BADGE_PERFECTIONIST) &&
            report.getTotalQuestions() >= 5 && report.getCorrectCount() == report.getTotalQuestions()) {
            existing.add(BADGE_PERFECTIONIST);
            unlockedNow.add(BADGE_PERFECTIONIST);
        }

        // 3. Java Maestro: >= 80% on Java test
        if (!existing.contains(BADGE_JAVA_MAESTRO) &&
            report.getDomain().toLowerCase().contains("java") && report.getPercentage() >= 80) {
            existing.add(BADGE_JAVA_MAESTRO);
            unlockedNow.add(BADGE_JAVA_MAESTRO);
        }

        // 4. Aptitude Ace: >= 80% on Aptitude test
        if (!existing.contains(BADGE_APTITUDE_ACE) &&
            report.getDomain().toLowerCase().contains("aptitude") && report.getPercentage() >= 80) {
            existing.add(BADGE_APTITUDE_ACE);
            unlockedNow.add(BADGE_APTITUDE_ACE);
        }

        // 5. Logic Master: >= 80% on Logical Reasoning test
        if (!existing.contains(BADGE_LOGIC_MASTER) &&
            report.getDomain().toLowerCase().contains("logic") && report.getPercentage() >= 80) {
            existing.add(BADGE_LOGIC_MASTER);
            unlockedNow.add(BADGE_LOGIC_MASTER);
        }

        // 6. Streak Legend: streak >= 3
        if (!existing.contains(BADGE_STREAK_LEGEND) && candidate.getStreakCount() >= 3) {
            existing.add(BADGE_STREAK_LEGEND);
            unlockedNow.add(BADGE_STREAK_LEGEND);
        }

        // 7. Placement Ready: >= 75% on Company Mock Exam
        if (!existing.contains(BADGE_PLACEMENT_READY) &&
            report.getDomain().toLowerCase().contains("placement") && report.getPercentage() >= 75) {
            existing.add(BADGE_PLACEMENT_READY);
            unlockedNow.add(BADGE_PLACEMENT_READY);
        }

        return unlockedNow;
    }

    /**
     * Generates a deterministic Daily Challenge test (5 questions) seeded by current day.
     */
    public List<Question> generateDailyChallenge(List<Question> fullBank) {
        List<Question> challenge = new ArrayList<>();
        if (fullBank == null || fullBank.isEmpty()) return challenge;

        long daySeed = LocalDate.now().toEpochDay();
        Random rng = new Random(daySeed);

        // Pick one question per domain
        Map<String, List<Question>> domainBuckets = new HashMap<>();
        for (Question q : fullBank) {
            domainBuckets.computeIfAbsent(q.getDomain(), k -> new ArrayList<>()).add(q);
        }

        for (List<Question> list : domainBuckets.values()) {
            if (!list.isEmpty() && challenge.size() < 5) {
                int idx = rng.nextInt(list.size());
                challenge.add(list.get(idx));
            }
        }

        return challenge;
    }
}
