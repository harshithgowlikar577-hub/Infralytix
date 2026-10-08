package service;

import model.MCQEvaluation;
import model.Question;
import util.EmptySelectionException;

/**
 * Interface defining evaluation contract for assessment responses.
 * Demonstrates Abstraction and Interface design.
 */
public interface Evaluator {
    MCQEvaluation evaluateAnswer(Question question, char chosenOption, int timeTakenSeconds)
            throws EmptySelectionException;
}
