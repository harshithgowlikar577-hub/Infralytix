package model;

import java.util.*;

public class JavaAssessment extends Assessment {

    public JavaAssessment() {
        this(null, "Adaptive");
    }

    public JavaAssessment(Candidate candidate, String selectedDifficulty) {
        super(candidate, selectedDifficulty);
    }

    @Override
    public String getDomain() {
        return "Java Programming";
    }

    @Override
    public void loadQuestions(List<Question> questionBank, int maxQuestions) {
        candidateQuestionPool.clear();
        questions.clear();

        List<Question> domainPool = new ArrayList<>();
        for (Question q : questionBank) {
            if (q.getDomain().equalsIgnoreCase("Java Programming") || q.getDomain().equalsIgnoreCase("Java")) {
                domainPool.add(q);
            }
        }
        Collections.shuffle(domainPool);
        candidateQuestionPool.addAll(domainPool);

        if (selectedDifficulty.equalsIgnoreCase("Adaptive")) {
            List<Question> easy = new ArrayList<>();
            List<Question> medium = new ArrayList<>();
            List<Question> hard = new ArrayList<>();

            for (Question q : domainPool) {
                if (q.getDifficulty().equalsIgnoreCase("Easy")) easy.add(q);
                else if (q.getDifficulty().equalsIgnoreCase("Medium")) medium.add(q);
                else if (q.getDifficulty().equalsIgnoreCase("Hard")) hard.add(q);
            }

            int count = 0;
            while (count < maxQuestions && (!easy.isEmpty() || !medium.isEmpty() || !hard.isEmpty())) {
                if (!easy.isEmpty() && count < maxQuestions / 3) {
                    questions.add(easy.remove(0));
                    count++;
                } else if (!medium.isEmpty() && count < (2 * maxQuestions) / 3) {
                    questions.add(medium.remove(0));
                    count++;
                } else if (!hard.isEmpty()) {
                    questions.add(hard.remove(0));
                    count++;
                } else if (!medium.isEmpty()) {
                    questions.add(medium.remove(0));
                    count++;
                } else if (!easy.isEmpty()) {
                    questions.add(easy.remove(0));
                    count++;
                }
            }
        } else {
            for (Question q : domainPool) {
                if (q.getDifficulty().equalsIgnoreCase(selectedDifficulty)) {
                    questions.add(q);
                    if (questions.size() >= maxQuestions) break;
                }
            }
        }

        if (questions.size() < maxQuestions && !domainPool.isEmpty()) {
            for (Question q : domainPool) {
                if (!questions.contains(q)) {
                    questions.add(q);
                    if (questions.size() >= maxQuestions) break;
                }
            }
        }
    }
}
