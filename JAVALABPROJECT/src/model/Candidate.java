package model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.*;

/**
 * Candidate Model class representing a registered placement student.
 * Encapsulates profile details, assessment history, XP points, Level, Streak, and Badges.
 */
public class Candidate implements Serializable {
    private static final long serialVersionUID = 1L;

    private String username;
    private String password;
    private String name;
    private String rollNumber;
    private String branch;

    // Gamification state
    private int xpPoints;
    private String level;          // Beginner, Intermediate, Advanced, Expert
    private int streakCount;       // Consecutive active days/tests
    private String lastActiveDate; // YYYY-MM-DD
    private Set<String> unlockedBadges;

    private List<AssessmentSessionReport> assessmentHistory;

    public Candidate() {
        this.assessmentHistory = new ArrayList<>();
        this.unlockedBadges = new HashSet<>();
        this.level = "Beginner";
        this.streakCount = 1;
        this.lastActiveDate = LocalDate.now().toString();
    }

    public Candidate(String username, String password, String name, String rollNumber, String branch) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.rollNumber = rollNumber;
        this.branch = branch;
        this.xpPoints = 0;
        this.level = "Beginner";
        this.streakCount = 1;
        this.lastActiveDate = LocalDate.now().toString();
        this.unlockedBadges = new HashSet<>();
        this.assessmentHistory = new ArrayList<>();
    }

    public static Candidate fromPipeDelimited(String line) {
        if (line == null || line.trim().isEmpty() || line.trim().startsWith("#")) return null;
        String[] parts = line.split("\\|", -1);
        if (parts.length < 5) return null;

        Candidate c = new Candidate(parts[0].trim(), parts[1].trim(), parts[2].trim(),
                parts[3].trim(), parts[4].trim());

        if (parts.length >= 6 && !parts[5].trim().isEmpty()) {
            try { c.setXpPoints(Integer.parseInt(parts[5].trim())); } catch (Exception ignored) {}
        }
        if (parts.length >= 7 && !parts[6].trim().isEmpty()) {
            c.setLevel(parts[6].trim());
        }
        if (parts.length >= 8 && !parts[7].trim().isEmpty()) {
            try { c.setStreakCount(Integer.parseInt(parts[7].trim())); } catch (Exception ignored) {}
        }
        if (parts.length >= 9 && !parts[8].trim().isEmpty()) {
            c.setLastActiveDate(parts[8].trim());
        }
        if (parts.length >= 10 && !parts[9].trim().isEmpty()) {
            String[] bArr = parts[9].trim().split(",");
            for (String b : bArr) {
                if (!b.trim().isEmpty()) c.getUnlockedBadges().add(b.trim());
            }
        }
        c.updateLevel();
        return c;
    }

    public String toPipeDelimited() {
        String badgeStr = String.join(",", unlockedBadges);
        return username + "|" + password + "|" + name + "|" + rollNumber + "|" + branch +
                "|" + xpPoints + "|" + level + "|" + streakCount + "|" + lastActiveDate + "|" + badgeStr;
    }

    public void addXP(int points) {
        this.xpPoints = Math.max(0, this.xpPoints + points);
        updateLevel();
    }

    public void updateLevel() {
        if (xpPoints >= 800) {
            this.level = "Expert";
        } else if (xpPoints >= 400) {
            this.level = "Advanced";
        } else if (xpPoints >= 150) {
            this.level = "Intermediate";
        } else {
            this.level = "Beginner";
        }
    }

    public void checkAndIncrementStreak() {
        String today = LocalDate.now().toString();
        if (lastActiveDate != null) {
            try {
                LocalDate last = LocalDate.parse(lastActiveDate);
                LocalDate curr = LocalDate.now();
                long diff = java.time.temporal.ChronoUnit.DAYS.between(last, curr);
                if (diff == 1) {
                    streakCount++;
                } else if (diff > 1) {
                    streakCount = 1;
                }
            } catch (Exception e) {
                streakCount = 1;
            }
        }
        this.lastActiveDate = today;
    }

    public double getAverageScore() {
        if (assessmentHistory.isEmpty()) return 0.0;
        int sum = 0;
        for (AssessmentSessionReport r : assessmentHistory) {
            sum += r.getPercentage();
        }
        return Math.round(((double) sum / assessmentHistory.size()) * 10.0) / 10.0;
    }

    public int getBestScore() {
        int max = 0;
        for (AssessmentSessionReport r : assessmentHistory) {
            if (r.getPercentage() > max) max = r.getPercentage();
        }
        return max;
    }

    public int getTotalAssessments() {
        return assessmentHistory.size();
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public int getXpPoints() { return xpPoints; }
    public void setXpPoints(int xpPoints) { this.xpPoints = xpPoints; updateLevel(); }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public int getStreakCount() { return streakCount; }
    public void setStreakCount(int streakCount) { this.streakCount = streakCount; }

    public String getLastActiveDate() { return lastActiveDate; }
    public void setLastActiveDate(String lastActiveDate) { this.lastActiveDate = lastActiveDate; }

    public Set<String> getUnlockedBadges() { return unlockedBadges; }
    public void setUnlockedBadges(Set<String> unlockedBadges) { this.unlockedBadges = unlockedBadges; }

    public List<AssessmentSessionReport> getAssessmentHistory() { return assessmentHistory; }
    public void setAssessmentHistory(List<AssessmentSessionReport> history) {
        this.assessmentHistory = (history != null) ? history : new ArrayList<>();
    }
    public void addReportToHistory(AssessmentSessionReport report) {
        if (this.assessmentHistory == null) {
            this.assessmentHistory = new ArrayList<>();
        }
        if (report != null) {
            this.assessmentHistory.add(report);
        }
    }

    @Override
    public String toString() {
        return name + " (" + rollNumber + " - " + branch + ") [" + level + " | " + xpPoints + " XP]";
    }
}
