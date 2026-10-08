package gui;

import model.Candidate;
import model.Interview;
import service.InterviewManager;
import util.UITheme;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;

/**
 * Interview Setup GUI Screen.
 * Allows candidates to select interview category, difficulty mode, and question volume.
 */
public class InterviewSetupScreen extends JDialog {

    private MainDashboard parentDashboard;
    private Candidate candidate;
    private InterviewManager interviewManager;

    private JComboBox<String> typeCombo;
    private JComboBox<String> difficultyCombo;
    private JComboBox<Integer> countCombo;

    public InterviewSetupScreen(MainDashboard parent, Candidate candidate, InterviewManager manager) {
        super(parent, "Setup Mock Interview Session", true);
        this.parentDashboard = parent;
        this.candidate = candidate;
        this.interviewManager = manager;

        setSize(560, 520);
        setLocationRelativeTo(parent);
        setResizable(false);

        initComponents();
    }

    private void initComponents() {
        JPanel root = new JPanel();
        root.setBackground(UITheme.BG_DARK);
        root.setLayout(new BoxLayout(root, BoxLayout.Y_AXIS));
        root.setBorder(new EmptyBorder(30, 35, 30, 35));

        JLabel title = new JLabel("Configure Interview Session");
        title.setFont(UITheme.FONT_TITLE);
        title.setForeground(UITheme.TEXT_PRIMARY);

        JLabel subtitle = new JLabel("Customize parameters to match your target interview domain");
        subtitle.setFont(UITheme.FONT_SMALL);
        subtitle.setForeground(UITheme.TEXT_MUTED);

        root.add(title);
        root.add(Box.createVerticalStrut(4));
        root.add(subtitle);
        root.add(Box.createVerticalStrut(25));

        // Form elements
        String[] types = {
                "Java Technical Round",
                "DBMS Technical Round",
                "HR Behavioral Round",
                "Comprehensive Mixed Round"
        };
        typeCombo = new JComboBox<>(types);
        styleComboBox(typeCombo);
        addSetting(root, "Interview Category", "Select technical specialization or general behavioral round", typeCombo);

        String[] difficulties = {
                "Adaptive (Dynamic Easy → Hard based on performance)",
                "Easy (Foundational conceptual questions)",
                "Medium (Standard technical interview scenarios)",
                "Hard (Advanced system design & edge cases)"
        };
        difficultyCombo = new JComboBox<>(difficulties);
        styleComboBox(difficultyCombo);
        addSetting(root, "Difficulty Progression", "Choose fixed tier or adaptive AI difficulty progression", difficultyCombo);

        Integer[] counts = {3, 5, 8, 10};
        countCombo = new JComboBox<>(counts);
        countCombo.setSelectedItem(5);
        styleComboBox(countCombo);
        addSetting(root, "Number of Questions", "Recommended: 5 questions for standard mock session", countCombo);

        root.add(Box.createVerticalStrut(20));

        JPanel buttonPanel = new JPanel(new GridLayout(1, 2, 15, 0));
        buttonPanel.setOpaque(false);
        buttonPanel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 42));

        JButton cancelBtn = UITheme.createSecondaryButton("Cancel");
        cancelBtn.addActionListener(e -> dispose());

        JButton startBtn = UITheme.createPrimaryButton("Begin Interview 🚀");
        startBtn.addActionListener(e -> launchInterview());

        buttonPanel.add(cancelBtn);
        buttonPanel.add(startBtn);
        root.add(buttonPanel);

        setContentPane(root);
    }

    private void addSetting(JPanel panel, String labelText, String hintText, JComponent comp) {
        JLabel lbl = new JLabel(labelText);
        lbl.setFont(UITheme.FONT_BODY_BOLD);
        lbl.setForeground(UITheme.TEXT_PRIMARY);
        lbl.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel hint = new JLabel(hintText);
        hint.setFont(UITheme.FONT_SMALL);
        hint.setForeground(UITheme.TEXT_SECONDARY);
        hint.setAlignmentX(Component.LEFT_ALIGNMENT);

        comp.setMaximumSize(new Dimension(Integer.MAX_VALUE, 38));
        comp.setAlignmentX(Component.LEFT_ALIGNMENT);

        panel.add(lbl);
        panel.add(Box.createVerticalStrut(2));
        panel.add(hint);
        panel.add(Box.createVerticalStrut(6));
        panel.add(comp);
        panel.add(Box.createVerticalStrut(18));
    }

    private void styleComboBox(JComboBox<?> box) {
        box.setFont(UITheme.FONT_BODY);
        box.setBackground(UITheme.CARD_BG);
        box.setForeground(UITheme.TEXT_PRIMARY);
    }

    private void launchInterview() {
        String selectedTypeStr = (String) typeCombo.getSelectedItem();
        String selectedDiffRaw = (String) difficultyCombo.getSelectedItem();
        int count = (Integer) countCombo.getSelectedItem();

        String parsedType = "Java";
        if (selectedTypeStr.contains("HR")) parsedType = "HR";
        else if (selectedTypeStr.contains("DBMS")) parsedType = "DBMS";
        else if (selectedTypeStr.contains("Mixed")) parsedType = "Mixed";

        String parsedDiff = "Adaptive";
        if (selectedDiffRaw.startsWith("Easy")) parsedDiff = "Easy";
        else if (selectedDiffRaw.startsWith("Medium")) parsedDiff = "Medium";
        else if (selectedDiffRaw.startsWith("Hard")) parsedDiff = "Hard";

        Interview interview = interviewManager.startInterview(candidate, parsedType, parsedDiff, count);

        if (interview.getQuestions().isEmpty()) {
            JOptionPane.showMessageDialog(this, "No questions found matching the selected criteria. Please verify questions.txt.",
                    "Question Bank Empty", JOptionPane.WARNING_MESSAGE);
            return;
        }

        dispose();
        parentDashboard.setVisible(false);

        InterviewScreen screen = new InterviewScreen(parentDashboard, candidate, interviewManager);
        screen.setVisible(true);
    }
}
