package main;

import gui.LoginScreen;
import service.AssessmentManager;
import util.FileManager;

import javax.swing.*;

/**
 * Application Entry Point.
 * Launches the AI Interview Simulator & Placement Assessment Platform.
 */
public class Main {

    public static void main(String[] args) {
        // Set cross-platform look and feel with dark system hints
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception ignored) {}

        util.UITheme.applyGlobalLaf();
        SwingUtilities.invokeLater(() -> {
            FileManager fileManager = new FileManager();
            AssessmentManager assessmentManager = new AssessmentManager(fileManager);

            LoginScreen loginScreen = new LoginScreen(assessmentManager);
            loginScreen.setVisible(true);
        });
    }
}
