package model;

import java.io.Serializable;

/**
 * Encapsulates the evaluation result of a single multiple-choice response.
 * Implements strict negative marking scheme:
 *  Correct = +1.0
 *  Wrong   = -0.25
 *  Skipped =  0.0
 */
public class MCQEvaluation implements Serializable {
    private static final long serialVersionUID = 1L;

    private Question question;
    private char selectedOption; // 'A', 'B', 'C', 'D' or 'S' (Skipped)
    private boolean isCorrect;
    private boolean isSkipped;
    private double marksAwarded; // +1.0, -0.25, 0.0
    private int timeTakenSeconds;
    private String feedback;

    // Standardized fields required by MCQ Evaluation architecture
    private String topic;
    private String difficulty;
    private char chosenAnswer;
    private char correctAnswer;
    private String status; // "CORRECT", "WRONG", "SKIPPED"
    private String explanation;

    public MCQEvaluation(Question question, char selectedOption, int timeTakenSeconds) {
        this.question = question;
        this.selectedOption = Character.toUpperCase(selectedOption);
        this.chosenAnswer = this.selectedOption;
        this.timeTakenSeconds = Math.max(0, timeTakenSeconds);

        if (question != null) {
            this.topic = question.getTopic() != null ? question.getTopic() : "General";
            this.difficulty = question.getDifficulty() != null ? question.getDifficulty() : "Medium";
            this.correctAnswer = Character.toUpperCase(question.getCorrectAnswer());
            this.explanation = question.getExplanation() != null ? question.getExplanation() : "";
        } else {
            this.topic = "General";
            this.difficulty = "Medium";
            this.correctAnswer = ' ';
            this.explanation = "";
        }

        if (this.selectedOption == 'S' || this.selectedOption == ' ' || this.selectedOption == '\0') {
            this.isSkipped = true;
            this.isCorrect = false;
            this.status = "SKIPPED";
            this.marksAwarded = 0.0;
            this.feedback = "Question Skipped (0 marks). Correct Answer was: Option " + (question != null ? question.getCorrectAnswer() : "");
        } else if (question != null && question.isCorrect(this.selectedOption)) {
            this.isSkipped = false;
            this.isCorrect = true;
            this.status = "CORRECT";
            this.marksAwarded = 1.0;
            this.feedback = "Correct! (+1.0 Mark). " + this.explanation;
        } else {
            this.isSkipped = false;
            this.isCorrect = false;
            this.status = "WRONG";
            this.marksAwarded = -0.25;
            this.feedback = "Incorrect (-0.25 Negative Mark). Correct Answer: Option " +
                    (question != null ? question.getCorrectAnswer() : "") + ". " + this.explanation;
        }
    }

    // Mandatory getters required by MCQ Evaluation Model
    public String getTopic() { return topic != null ? topic : (question != null ? question.getTopic() : "General"); }
    public String getDifficulty() { return difficulty != null ? difficulty : (question != null ? question.getDifficulty() : "Medium"); }
    public String getStatus() { return status != null ? status : (isCorrect ? "CORRECT" : (isSkipped ? "SKIPPED" : "WRONG")); }
    public String getExplanation() { return explanation != null ? explanation : (question != null ? question.getExplanation() : ""); }
    public char getChosenAnswer() { return chosenAnswer; }
    public char getCorrectAnswer() { return correctAnswer; }
    public String getOptionA() { return question != null ? question.getOptionA() : ""; }
    public String getOptionB() { return question != null ? question.getOptionB() : ""; }
    public String getOptionC() { return question != null ? question.getOptionC() : ""; }
    public String getOptionD() { return question != null ? question.getOptionD() : ""; }
    public boolean hasCodeSnippet() { return question != null && question.hasCodeSnippet(); }
    public String getFormattedQuestionText() { return question != null ? question.getFormattedQuestionText() : ""; }

    public Question getQuestion() { return question; }
    public char getSelectedOption() { return selectedOption; }
    public boolean isCorrect() { return isCorrect; }
    public boolean isSkipped() { return isSkipped; }
    public double getMarksAwarded() { return marksAwarded; }
    public int getTimeTakenSeconds() { return timeTakenSeconds; }
    public String getFeedback() { return feedback; }

    public String getCandidateAnswerText() {
        if (isSkipped) return "Skipped";
        return selectedOption + (question != null ? " (" + question.getOption(selectedOption) + ")" : "");
    }

    public String getCorrectAnswerText() {
        if (question == null) return String.valueOf(correctAnswer);
        return question.getCorrectAnswer() + " (" + question.getOption(question.getCorrectAnswer()) + ")";
    }
}
