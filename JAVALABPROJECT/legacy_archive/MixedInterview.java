package model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Specialization of Interview representing a Full Comprehensive Round
 * containing HR, Java, and DBMS questions.
 * Demonstrates Inheritance and polymorphism.
 */
public class MixedInterview extends Interview {

    public MixedInterview(Candidate candidate, String selectedDifficulty) {
        super(candidate, selectedDifficulty);
    }

    @Override
    public String getInterviewType() {
        return "Comprehensive Mixed Round";
    }

    @Override
    public int getPassingThreshold() {
        return 70; // 70% required for comprehensive clearance
    }

    @Override
    public void loadQuestions(List<Question> questionBank, int maxQuestions) {
        List<Question> hrList = new ArrayList<>();
        List<Question> javaList = new ArrayList<>();
        List<Question> dbmsList = new ArrayList<>();

        String diff = currentDifficulty;
        for (Question q : questionBank) {
            boolean diffMatch = selectedDifficulty.equalsIgnoreCase("Adaptive") || q.getDifficulty().equalsIgnoreCase(diff);
            if (diffMatch) {
                if ("HR".equalsIgnoreCase(q.getCategory())) hrList.add(q);
                else if ("Java".equalsIgnoreCase(q.getCategory())) javaList.add(q);
                else if ("DBMS".equalsIgnoreCase(q.getCategory())) dbmsList.add(q);
            }
        }

        Collections.shuffle(hrList);
        Collections.shuffle(javaList);
        Collections.shuffle(dbmsList);

        this.questions.clear();
        int perCategory = Math.max(1, maxQuestions / 3);

        for (int i = 0; i < Math.min(perCategory, hrList.size()); i++) this.questions.add(hrList.get(i));
        for (int i = 0; i < Math.min(perCategory, javaList.size()); i++) this.questions.add(javaList.get(i));
        for (int i = 0; i < Math.min(perCategory, dbmsList.size()); i++) this.questions.add(dbmsList.get(i));

        // Fill remaining if needed
        if (this.questions.size() < maxQuestions) {
            for (Question q : questionBank) {
                if (!this.questions.contains(q)) {
                    this.questions.add(q);
                    if (this.questions.size() >= maxQuestions) break;
                }
            }
        }
    }
}
