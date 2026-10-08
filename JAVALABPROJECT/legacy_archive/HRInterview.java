package model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Specialization of Interview representing an HR Round.
 * Demonstrates Inheritance and polymorphism.
 */
public class HRInterview extends Interview {

    public HRInterview(Candidate candidate, String selectedDifficulty) {
        super(candidate, selectedDifficulty);
    }

    @Override
    public String getInterviewType() {
        return "HR Behavioral Round";
    }

    @Override
    public int getPassingThreshold() {
        return 60; // 60% required for HR round clearance
    }

    @Override
    public void loadQuestions(List<Question> questionBank, int maxQuestions) {
        List<Question> filtered = new ArrayList<>();
        String diff = currentDifficulty;

        for (Question q : questionBank) {
            if ("HR".equalsIgnoreCase(q.getCategory())) {
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

        // Fallback if not enough matching difficulty questions
        if (this.questions.isEmpty()) {
            for (Question q : questionBank) {
                if ("HR".equalsIgnoreCase(q.getCategory())) {
                    this.questions.add(q);
                    if (this.questions.size() >= maxQuestions) break;
                }
            }
        }
    }
}
