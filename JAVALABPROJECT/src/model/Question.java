package model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Question Model class representing an MCQ placement assessment question.
 * Demonstrates strict Encapsulation with private fields, getters, and setters.
 */
public class Question implements Serializable {
    private static final long serialVersionUID = 1L;

    private int questionId;
    private String domain;      // Aptitude, Logical Reasoning, Java Programming, DBMS, Computer Science Fundamentals
    private String topic;       // e.g. Percentage, Time and Work, OOP, Joins, etc.
    private String difficulty;  // Easy, Medium, Hard
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private char correctAnswer; // 'A', 'B', 'C', 'D'
    private String explanation;

    public Question() {
        this.explanation = "";
    }

    public Question(int questionId, String domain, String topic, String difficulty,
                    String questionText, String optionA, String optionB,
                    String optionC, String optionD, char correctAnswer, String explanation) {
        this.questionId = questionId;
        this.domain = (domain != null) ? domain.trim() : "General";
        this.topic = (topic != null && !topic.trim().isEmpty()) ? topic.trim() : "General";
        this.difficulty = (difficulty != null) ? difficulty.trim() : "Medium";
        this.questionText = (questionText != null) ? questionText.trim() : "";
        this.optionA = (optionA != null) ? optionA.trim() : "";
        this.optionB = (optionB != null) ? optionB.trim() : "";
        this.optionC = (optionC != null) ? optionC.trim() : "";
        this.optionD = (optionD != null) ? optionD.trim() : "";
        this.correctAnswer = Character.toUpperCase(correctAnswer);
        this.explanation = (explanation != null) ? explanation.trim() : "";
    }

    public static Question fromPipeDelimited(String line) {
        if (line == null || line.trim().isEmpty() || line.trim().startsWith("#")) {
            return null;
        }

        String[] parts = line.split("\\|", -1);
        try {
            if (parts.length >= 11) {
                int id = Integer.parseInt(parts[0].trim());
                String dom = parts[1].trim();
                String top = parts[2].trim();
                String diff = parts[3].trim();
                String text = parts[4].trim();
                String a = parts[5].trim();
                String b = parts[6].trim();
                String c = parts[7].trim();
                String d = parts[8].trim();
                char ans = parts[9].trim().charAt(0);
                String exp = parts[10].trim();
                return new Question(id, dom, top, diff, text, a, b, c, d, ans, exp);
            } else if (parts.length >= 9) {
                int id = Integer.parseInt(parts[0].trim());
                String dom = parts[1].trim();
                String diff = parts[2].trim();
                String text = parts[3].trim();
                String a = parts[4].trim();
                String b = parts[5].trim();
                String c = parts[6].trim();
                String d = parts[7].trim();
                char ans = parts[8].trim().charAt(0);
                String exp = (parts.length >= 10) ? parts[9].trim() : "";
                return new Question(id, dom, "General", diff, text, a, b, c, d, ans, exp);
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to parse question line: " + line);
        }
        return null;
    }

    public String toPipeDelimited() {
        return questionId + "|" + domain + "|" + topic + "|" + difficulty + "|" +
                questionText.replace("\n", "\\n") + "|" + optionA + "|" + optionB + "|" +
                optionC + "|" + optionD + "|" + correctAnswer + "|" + explanation;
    }

    public String getOption(char opt) {
        switch (Character.toUpperCase(opt)) {
            case 'A': return optionA;
            case 'B': return optionB;
            case 'C': return optionC;
            case 'D': return optionD;
            default: return "";
        }
    }

    public boolean isCorrect(char chosenOption) {
        return Character.toUpperCase(chosenOption) == Character.toUpperCase(correctAnswer);
    }

    public boolean hasCodeSnippet() {
        return questionText.contains("\\n") || questionText.contains("class ") ||
               questionText.contains("public static void") || questionText.contains("SELECT ");
    }

    public String getFormattedQuestionText() {
        return questionText.replace("\\n", "\n");
    }

    // Encapsulation Getters and Setters
    public int getQuestionId() { return questionId; }
    public void setQuestionId(int questionId) { this.questionId = questionId; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getOptionA() { return optionA; }
    public void setOptionA(String optionA) { this.optionA = optionA; }

    public String getOptionB() { return optionB; }
    public void setOptionB(String optionB) { this.optionB = optionB; }

    public String getOptionC() { return optionC; }
    public void setOptionC(String optionC) { this.optionC = optionC; }

    public String getOptionD() { return optionD; }
    public void setOptionD(String optionD) { this.optionD = optionD; }

    public char getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(char correctAnswer) { this.correctAnswer = Character.toUpperCase(correctAnswer); }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Question question = (Question) o;
        return questionId == question.questionId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(questionId);
    }

    @Override
    public String toString() {
        return "[" + domain + " | " + topic + " | " + difficulty + "] Q" + questionId + ": " +
                (questionText.length() > 50 ? questionText.substring(0, 47) + "..." : questionText);
    }
}
