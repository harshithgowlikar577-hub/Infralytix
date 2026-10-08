package util;

/**
 * Custom exception thrown when text data files fail to load or parse properly.
 * Demonstrates Java Custom Checked Exception handling for persistent I/O layers.
 */
public class FileReadException extends Exception {
    public FileReadException(String message) {
        super(message);
    }

    public FileReadException(String message, Throwable cause) {
        super(message, cause);
    }
}
