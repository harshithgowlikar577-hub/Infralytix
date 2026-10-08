package model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Specialization of Interview representing a DBMS & SQL Technical Round.
 * Demonstrates Inheritance and polymorphism.
 */
public class DBMSInterview extends Interview {

    public DBMSInterview(Candidate candidate, String selectedDifficulty) {
        super(candidate, selectedDifficulty);
    }

    @Override
    public String getInterviewType() {
        return "DBMS Technical Round";
    }

    @Override
    public int getPassingThreshold() {
        return 65; // 65% required for DBMS round clearance
    }

    @Override
    public void loadQuestions(List<Question> questionBank, int maxQuestions) {
        List<Question> filtered = new ArrayList<>();
        String diff = currentDifficulty;

        for (Question q : questionBank) {
            if ("DBMS".equalsIgnoreCase(q.getCategory())) {
                if (selectedDifficulty.equalsIgnoreCase("Adaptive") || q.getDifficulty().equalsIgnoreCase(diff)) {
                    filtered.add(q);
                }
            }
        }

        Collections.shuffle(filtered);
        this.questions.clear();
        for (int i = 0; i < Math.min(maxQuestions, filtered.size()); i++) {
            this.questions.add(filtered.get(i));
        }

        // Fallback
        if (this.questions.isEmpty()) {
            for (Question q : questionBank) {
                if ("DBMS".equalsIgnoreCase(q.getCategory())) {
                    this.questions.add(q);
                    if (this.questions.size() >= maxQuestions) break;
                }
            }
        }
    }
}
