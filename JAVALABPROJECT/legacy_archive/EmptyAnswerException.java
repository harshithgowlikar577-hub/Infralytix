package util;

/**
 * Custom exception thrown when a candidate submits an empty, blank, or invalid answer.
 * Demonstrates Java Custom Checked Exception handling and input validation.
 */
public class EmptyAnswerException extends Exception {
    public EmptyAnswerException(String message) {
        super(message);
    }

    public EmptyAnswerException(String message, Throwable cause) {
        super(message, cause);
    }
}
