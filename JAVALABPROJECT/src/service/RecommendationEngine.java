package service;

import model.AssessmentSessionReport;
import model.Candidate;

import java.util.*;

/**
 * Intelligent Recommendation Engine for placement preparation.
 * Analyzes topic performance scores, detects weak vs strong areas,
 * and generates actionable, personalized learning paths.
 */
public class RecommendationEngine {

    private static final Map<String, String> TOPIC_STUDY_TIPS = new HashMap<>();

    static {
        // Aptitude
        TOPIC_STUDY_TIPS.put("Percentage", "Master fraction-to-percentage conversions (e.g. 1/7 = 14.28%, 1/8 = 12.5%) for 2x faster calculation.");
        TOPIC_STUDY_TIPS.put("Profit and Loss", "Focus on Cost Price base reference and effective discount formulas: D = d1 + d2 - (d1*d2)/100.");
        TOPIC_STUDY_TIPS.put("Time and Work", "Use LCM method to assign total units of work rather than fraction-addition for rapid solving.");
        TOPIC_STUDY_TIPS.put("Time Speed Distance", "Remember 1 km/h = 5/18 m/s and average speed for equal distances is 2xy/(x+y).");
        TOPIC_STUDY_TIPS.put("Boats and Streams", "Always isolate Still Water speed (D+U)/2 and Stream speed (D-U)/2 first.");
        TOPIC_STUDY_TIPS.put("Compound Interest", "Practice 2-year difference formula: Diff = P * (R/100)^2.");
        TOPIC_STUDY_TIPS.put("Probability", "Master complement probability P(E) = 1 - P(not E) for 'at least one' problems.");

        // Reasoning
        TOPIC_STUDY_TIPS.put("Coding Decoding", "Memorize forward and reverse alphabet positions (EJOTY: 5, 10, 15, 20, 25).");
        TOPIC_STUDY_TIPS.put("Blood Relations", "Draw tree diagrams immediately marking genders (+ for male, - for female, = for spouses).");
        TOPIC_STUDY_TIPS.put("Syllogisms", "Use Venn diagram intersection rules; avoid assuming outside the given premises.");
        TOPIC_STUDY_TIPS.put("Direction Sense", "Sketch N-S-E-W axis at problem start; remember right-turn facing North goes East.");

        // Java
        TOPIC_STUDY_TIPS.put("OOP Concepts", "Review the difference between Abstraction (hiding implementation) and Encapsulation (data protection).");
        TOPIC_STUDY_TIPS.put("Inheritance", "Remember variables in Java are shadowed (reference type), whereas instance methods are overridden dynamically.");
        TOPIC_STUDY_TIPS.put("Polymorphism", "Compile-time is method overloading; Runtime is method overriding using dynamic method dispatch.");
        TOPIC_STUDY_TIPS.put("Exception Handling", "Ensure finally block semantics are clear; finally overrides return statement values.");
        TOPIC_STUDY_TIPS.put("Collections Framework", "Review HashMap internal bucket treeification at threshold 8 and equals()/hashCode() contract.");
        TOPIC_STUDY_TIPS.put("Multithreading", "Understand wait() releases monitor lock whereas sleep() retains all locks.");

        // DBMS
        TOPIC_STUDY_TIPS.put("SQL Basics", "Remember WHERE filters rows before aggregation; HAVING filters grouped aggregated results.");
        TOPIC_STUDY_TIPS.put("Joins", "Master LEFT JOIN null checks to find unassociated records without subqueries.");
        TOPIC_STUDY_TIPS.put("Normalization", "2NF eliminates partial dependencies; 3NF eliminates transitive dependencies; BCNF requires superkey determinants.");
        TOPIC_STUDY_TIPS.put("ACID Properties", "Understand Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable.");
        TOPIC_STUDY_TIPS.put("Indexing", "B+ Trees hold records strictly at leaves with linked lists for high-speed range queries.");

        // CS Fundamentals
        TOPIC_STUDY_TIPS.put("Operating Systems", "Review Banker's algorithm for deadlock avoidance and paging address translation via TLB.");
        TOPIC_STUDY_TIPS.put("Computer Networks", "Learn the TCP 3-way handshake (SYN, SYN-ACK, ACK) and OSI 7-layer responsibilities.");
        TOPIC_STUDY_TIPS.put("Data Structures", "Practice Big-O time and space bounds for QuickSort, MergeSort, and BST tree operations.");
    }

    /**
     * Generates prioritized topic recommendations for the candidate.
     */
    public List<String> generateRecommendations(AssessmentSessionReport report, Candidate candidate) {
        List<String> recs = new ArrayList<>();
        if (report == null) return recs;

        // 1. Weak topics from current test
        for (String weak : report.getWeakAreas()) {
            String topicName = weak.split("\\s*\\(")[0].trim();
            String tip = TOPIC_STUDY_TIPS.get(topicName);
            if (tip != null) {
                recs.add("Priority Weak Topic: [" + topicName + "] - " + tip);
            } else {
                recs.add("Priority Weak Topic: [" + topicName + "] - Dedicate 30 mins to practice standard placement MCQs.");
            }
        }

        // 2. High impact placement advice based on accuracy
        if (report.getAccuracyPercentage() < 60.0) {
            recs.add("Pacing Tip: Your accuracy was " + (int) report.getAccuracyPercentage() +
                    "%. Slow down slightly to avoid negative marking (-0.25 penalty). Skip questions where uncertain.");
        } else if (report.getAverageTimeSeconds() > 22.0) {
            recs.add("Speed Drill: Average time per question was " + report.getAverageTimeSeconds() +
                    "s. Practice mental math and keyboard shortcuts to target under 15s per question.");
        } else if (report.getPercentage() >= 80) {
            recs.add("Placement Readiness: Exceptional performance (" + report.getPercentage() +
                    "% | " + report.getRankPercentile() + "th percentile). You are ready for company test rounds!");
        }

        // Fallback recommendations if none generated
        if (recs.isEmpty()) {
            recs.add("Continue daily streak drills to maintain sharp problem-solving reflexes.");
            recs.add("Attempt the multi-domain Placement Assessment Simulator (TCS NQT / Accenture) next.");
        }

        report.setRecommendations(recs);
        return recs;
    }
}
