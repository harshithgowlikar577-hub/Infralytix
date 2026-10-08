package service;

import model.MCQEvaluation;
import model.Question;
import util.EmptySelectionException;

/**
 * Multiple Choice Question (MCQ) Evaluator implementation.
 * Replaces keyword-based matching with objective evaluation:
 *  Correct = +1.0
 *  Wrong   = -0.25
 *  Skipped =  0.0
 */
public class MCQEvaluator implements Evaluator {

    @Override
    public MCQEvaluation evaluateAnswer(Question question, char chosenOption, int timeTakenSeconds)
            throws EmptySelectionException {
        if (question == null) {
            throw new IllegalArgumentException("Question cannot be null.");
        }

        char opt = Character.toUpperCase(chosenOption);
        if (opt != 'A' && opt != 'B' && opt != 'C' && opt != 'D' && opt != 'S') {
            throw new EmptySelectionException("Please select an option (A, B, C, or D) or click Skip.");
        }

        return new MCQEvaluation(question, opt, timeTakenSeconds);
    }
}
