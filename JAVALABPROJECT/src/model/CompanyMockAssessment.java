package model;

import java.util.*;

/**
 * Simulates real recruitment assessment tests for premier placement drives:
 * TCS NQT, Accenture, Infosys, Wipro, Cognizant, and Capgemini.
 * Balances questions across Aptitude, Logical Reasoning, Java, DBMS, and CS Fundamentals.
 */
public class CompanyMockAssessment extends Assessment {

    private String companyName;

    public CompanyMockAssessment() {
        this(null, "TCS NQT", "Adaptive");
    }

    public CompanyMockAssessment(String companyName) {
        this(null, companyName, "Adaptive");
    }

    public CompanyMockAssessment(Candidate candidate, String selectedDifficulty) {
        this(candidate, "TCS NQT", selectedDifficulty);
    }

    public CompanyMockAssessment(Candidate candidate, String companyName, String selectedDifficulty) {
        super(candidate, selectedDifficulty);
        this.companyName = (companyName != null) ? companyName : "TCS NQT";
    }

    @Override
    public String getDomain() {
        return companyName + " Placement Simulator";
    }

    public String getCompanyName() {
        return companyName;
    }

    @Override
    public void loadQuestions(List<Question> questionBank, int maxQuestions) {
        candidateQuestionPool.clear();
        questions.clear();

        // Categorize by domain
        Map<String, List<Question>> domainMap = new HashMap<>();
        for (Question q : questionBank) {
            domainMap.computeIfAbsent(q.getDomain(), k -> new ArrayList<>()).add(q);
        }

        for (List<Question> list : domainMap.values()) {
            Collections.shuffle(list);
        }

        // Proportional distribution for placement mock tests:
        // Aptitude (30%), Reasoning (25%), Java (20%), DBMS (15%), CS Fundamentals (10%)
        int aptCount = Math.max(2, (int) Math.round(maxQuestions * 0.30));
        int logCount = Math.max(2, (int) Math.round(maxQuestions * 0.25));
        int javaCount = Math.max(2, (int) Math.round(maxQuestions * 0.20));
        int dbmsCount = Math.max(1, (int) Math.round(maxQuestions * 0.15));
        int csCount = Math.max(1, maxQuestions - (aptCount + logCount + javaCount + dbmsCount));

        addDomainSamples(domainMap.get("Aptitude"), aptCount);
        addDomainSamples(domainMap.get("Logical Reasoning"), logCount);
        addDomainSamples(domainMap.get("Java Programming"), javaCount);
        addDomainSamples(domainMap.get("DBMS"), dbmsCount);
        addDomainSamples(domainMap.get("Computer Science Fundamentals"), csCount);

        // Mix all domains so test feels like an authentic company exam
        Collections.shuffle(questions);
        candidateQuestionPool.addAll(questionBank);
    }

    private void addDomainSamples(List<Question> pool, int targetCount) {
        if (pool == null || pool.isEmpty()) return;
        int added = 0;

        if (selectedDifficulty.equalsIgnoreCase("Adaptive")) {
            for (Question q : pool) {
                questions.add(q);
                added++;
                if (added >= targetCount) break;
            }
        } else {
            for (Question q : pool) {
                if (q.getDifficulty().equalsIgnoreCase(selectedDifficulty)) {
                    questions.add(q);
                    added++;
                    if (added >= targetCount) break;
                }
            }
            if (added < targetCount) {
                for (Question q : pool) {
                    if (!questions.contains(q)) {
                        questions.add(q);
                        added++;
                        if (added >= targetCount) break;
                    }
                }
            }
        }
    }
}
