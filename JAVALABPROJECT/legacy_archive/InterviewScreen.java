package gui;

import model.AnswerEvaluation;
import model.Candidate;
import model.Interview;
import model.Question;
import service.InterviewManager;
import util.EmptyAnswerException;
import util.UITheme;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import java.awt.*;
import java.awt.event.ActionEvent;

/**
 * InterviewScreen GUI.
 * Conducts the mock interview with live 60-second countdown timer, dynamic question rendering,
 * real-time answer input tracking, and instant diagnostic feedback.
 */
public class InterviewScreen extends JFrame {

    private static final int QUESTION_TIME_LIMIT = 60; // 60 seconds per question

    private MainDashboard dashboard;
    private Candidate candidate;
    private InterviewManager manager;
    private Interview activeInterview;

    // Timer state
    private Timer countdownTimer;
    private int secondsRemaining;

    // UI Components
    private JLabel progressLabel;
    private JProgressBar progressBar;
    private JLabel categoryBadge;
    private JLabel difficultyBadge;
    private JLabel timerLabel;
    private JTextArea questionArea;
    private JTextArea answerArea;
    private JLabel wordCountLabel;
    private JButton submitBtn;
    private JButton skipBtn;

    public InterviewScreen(MainDashboard dashboard, Candidate candidate, InterviewManager manager) {
        this.dashboard = dashboard;
        this.candidate = candidate;
        this.manager = manager;
        this.activeInterview = manager.getCurrentInterview();

        setTitle("AI Interview Simulator - Live Examination Session");
        setSize(920, 680);
        setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        setLocationRelativeTo(null);

        // Confirmation on window close
        addWindowListener(new java.awt.event.WindowAdapter() {
            @Override
            public void windowClosing(java.awt.event.WindowEvent e) {
                int res = JOptionPane.showConfirmDialog(InterviewScreen.this,
                        "Aborting the interview will discard progress. Are you sure?",
                        "Confirm Exit", JOptionPane.YES_NO_OPTION);
                if (res == JOptionPane.YES_OPTION) {
                    stopTimer();
                    dispose();
                    dashboard.setVisible(true);
                }
            }
        });

        initComponents();
        loadCurrentQuestion();
    }

    private void initComponents() {
        JPanel root = new JPanel(new BorderLayout(0, 16));
        root.setBackground(UITheme.BG_DARK);
        root.setBorder(new EmptyBorder(20, 25, 20, 25));

        // Top Status Header
        JPanel header = new JPanel(new BorderLayout());
        header.setOpaque(false);

        JPanel leftHeader = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        leftHeader.setOpaque(false);

        progressLabel = new JLabel("Question 1 of 5");
        progressLabel.setFont(UITheme.FONT_SUBTITLE);
        progressLabel.setForeground(UITheme.TEXT_PRIMARY);

        categoryBadge = new JLabel(" JAVA ");
        categoryBadge.setFont(UITheme.FONT_SMALL);
        categoryBadge.setOpaque(true);
        categoryBadge.setBackground(UITheme.CARD_BG_LIGHT);
        categoryBadge.setForeground(UITheme.PRIMARY);
        categoryBadge.setBorder(new LineBorder(UITheme.PRIMARY, 1, true));

        difficultyBadge = new JLabel(" MEDIUM ");
        difficultyBadge.setFont(UITheme.FONT_SMALL);
        difficultyBadge.setOpaque(true);
        difficultyBadge.setBackground(UITheme.CARD_BG_LIGHT);
        difficultyBadge.setForeground(UITheme.WARNING);
        difficultyBadge.setBorder(new LineBorder(UITheme.WARNING, 1, true));

        leftHeader.add(progressLabel);
        leftHeader.add(categoryBadge);
        leftHeader.add(difficultyBadge);

        // Timer Panel (Right)
        timerLabel = new JLabel("⏱ 01:00", SwingConstants.RIGHT);
        timerLabel.setFont(new Font("Consolas", Font.BOLD, 22));
        timerLabel.setForeground(UITheme.SUCCESS);

        header.add(leftHeader, BorderLayout.WEST);
        header.add(timerLabel, BorderLayout.EAST);

        // Progress Bar
        progressBar = new JProgressBar(0, activeInterview.getTotalQuestionsCount());
        progressBar.setValue(0);
        progressBar.setForeground(UITheme.PRIMARY);
        progressBar.setBackground(UITheme.CARD_BG);
        progressBar.setPreferredSize(new Dimension(Integer.MAX_VALUE, 6));
        progressBar.setBorder(BorderFactory.createEmptyBorder());

        JPanel topContainer = new JPanel(new BorderLayout(0, 8));
        topContainer.setOpaque(false);
        topContainer.add(header, BorderLayout.NORTH);
        topContainer.add(progressBar, BorderLayout.SOUTH);
        root.add(topContainer, BorderLayout.NORTH);

        // Center: Question Prompt + Candidate Answer Area
        JPanel centerPanel = new JPanel();
        centerPanel.setLayout(new BoxLayout(centerPanel, BoxLayout.Y_AXIS));
        centerPanel.setOpaque(false);

        // Question Card
        JPanel questionCard = UITheme.createCardPanel();
        questionCard.setLayout(new BorderLayout());
        questionCard.setMaximumSize(new Dimension(Integer.MAX_VALUE, 110));

        JLabel qTitle = new JLabel("INTERVIEW QUESTION");
        qTitle.setFont(UITheme.FONT_SMALL);
        qTitle.setForeground(UITheme.PRIMARY);

        questionArea = new JTextArea("Loading question prompt...");
        questionArea.setFont(new Font("Segoe UI", Font.BOLD, 17));
        questionArea.setForeground(UITheme.TEXT_PRIMARY);
        questionArea.setBackground(UITheme.CARD_BG);
        questionArea.setWrapStyleWord(true);
        questionArea.setLineWrap(true);
        questionArea.setEditable(false);
        questionArea.setBorder(new EmptyBorder(6, 0, 4, 0));

        questionCard.add(qTitle, BorderLayout.NORTH);
        questionCard.add(questionArea, BorderLayout.CENTER);
        centerPanel.add(questionCard);
        centerPanel.add(Box.createVerticalStrut(15));

        // Answer Card
        JPanel answerCard = UITheme.createCardPanel();
        answerCard.setLayout(new BorderLayout(0, 8));

        JLabel ansTitle = new JLabel("YOUR RESPONSE (Type technical explanation using key concepts):");
        ansTitle.setFont(UITheme.FONT_SMALL);
        ansTitle.setForeground(UITheme.TEXT_SECONDARY);

        answerArea = new JTextArea();
        answerArea.setFont(UITheme.FONT_BODY);
        answerArea.setForeground(UITheme.TEXT_PRIMARY);
        answerArea.setBackground(UITheme.INPUT_BG);
        answerArea.setCaretColor(UITheme.PRIMARY);
        answerArea.setLineWrap(true);
        answerArea.setWrapStyleWord(true);
        answerArea.setBorder(new EmptyBorder(10, 12, 10, 12));

        JScrollPane answerScroll = new JScrollPane(answerArea);
        answerScroll.setBorder(new LineBorder(UITheme.BORDER_COLOR, 1, true));
        answerScroll.getViewport().setBackground(UITheme.INPUT_BG);

        // Bottom word counter
        wordCountLabel = new JLabel("Words: 0 | Characters: 0", SwingConstants.RIGHT);
        wordCountLabel.setFont(UITheme.FONT_SMALL);
        wordCountLabel.setForeground(UITheme.TEXT_MUTED);

        answerArea.getDocument().addDocumentListener(new DocumentListener() {
            public void insertUpdate(DocumentEvent e) { updateCount(); }
            public void removeUpdate(DocumentEvent e) { updateCount(); }
            public void changedUpdate(DocumentEvent e) { updateCount(); }
            private void updateCount() {
                String text = answerArea.getText().trim();
                int chars = text.length();
                int words = text.isEmpty() ? 0 : text.split("\\s+").length;
                wordCountLabel.setText("Words: " + words + " | Characters: " + chars);
            }
        });

        answerCard.add(ansTitle, BorderLayout.NORTH);
        answerCard.add(answerScroll, BorderLayout.CENTER);
        answerCard.add(wordCountLabel, BorderLayout.SOUTH);
        centerPanel.add(answerCard);

        root.add(centerPanel, BorderLayout.CENTER);

        // Bottom Controls
        JPanel bottomBar = new JPanel(new BorderLayout());
        bottomBar.setOpaque(false);

        JLabel tipLabel = new JLabel("💡 Tip: Answer concisely with foundational concepts, keywords, and accurate syntax.");
        tipLabel.setFont(UITheme.FONT_SMALL);
        tipLabel.setForeground(UITheme.TEXT_MUTED);

        JPanel buttonGroup = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 0));
        buttonGroup.setOpaque(false);

        skipBtn = UITheme.createSecondaryButton("Skip Question");
        skipBtn.addActionListener(this::handleSkip);

        submitBtn = UITheme.createPrimaryButton("Submit Answer ➔");
        submitBtn.addActionListener(this::handleSubmit);

        buttonGroup.add(skipBtn);
        buttonGroup.add(submitBtn);

        bottomBar.add(tipLabel, BorderLayout.WEST);
        bottomBar.add(buttonGroup, BorderLayout.EAST);
        root.add(bottomBar, BorderLayout.SOUTH);

        setContentPane(root);
    }

    private void loadCurrentQuestion() {
        if (!activeInterview.hasNextQuestion()) {
            finishInterviewSession();
            return;
        }

        Question q = activeInterview.getCurrentQuestion();
        int currentNum = activeInterview.getCurrentIndex() + 1;
        int totalNum = activeInterview.getTotalQuestionsCount();

        progressLabel.setText(String.format("Question %d of %d", currentNum, totalNum));
        progressBar.setValue(currentNum - 1);

        categoryBadge.setText(" " + q.getCategory().toUpperCase() + " ");
        difficultyBadge.setText(" " + q.getDifficulty().toUpperCase() + " ");

        // Color badge based on difficulty
        if ("Easy".equalsIgnoreCase(q.getDifficulty())) {
            difficultyBadge.setForeground(UITheme.SUCCESS);
        } else if ("Hard".equalsIgnoreCase(q.getDifficulty())) {
            difficultyBadge.setForeground(UITheme.DANGER);
        } else {
            difficultyBadge.setForeground(UITheme.WARNING);
        }

        questionArea.setText(q.getQuestionText());
        answerArea.setText("");
        wordCountLabel.setText("Words: 0 | Characters: 0");
        answerArea.requestFocusInWindow();

        startTimer();
    }

    private void startTimer() {
        stopTimer();
        secondsRemaining = QUESTION_TIME_LIMIT;
        updateTimerDisplay();

        countdownTimer = new Timer(1000, (ActionEvent e) -> {
            secondsRemaining--;
            updateTimerDisplay();

            if (secondsRemaining <= 0) {
                stopTimer();
                JOptionPane.showMessageDialog(this,
                        "Time's up for this question! Your current response will be automatically submitted.",
                        "Countdown Expired", JOptionPane.WARNING_MESSAGE);
                autoSubmitOnTimeout();
            }
        });
        countdownTimer.start();
    }

    private void stopTimer() {
        if (countdownTimer != null && countdownTimer.isRunning()) {
            countdownTimer.stop();
        }
    }

    private void updateTimerDisplay() {
        int minutes = secondsRemaining / 60;
        int seconds = secondsRemaining % 60;
        timerLabel.setText(String.format("⏱ %02d:%02d", minutes, seconds));

        if (secondsRemaining > 20) {
            timerLabel.setForeground(UITheme.SUCCESS);
        } else if (secondsRemaining > 10) {
            timerLabel.setForeground(UITheme.WARNING);
        } else {
            timerLabel.setForeground(UITheme.DANGER);
        }
    }

    private void handleSubmit(ActionEvent e) {
        String answer = answerArea.getText().trim();
        int timeSpent = QUESTION_TIME_LIMIT - secondsRemaining;

        try {
            stopTimer();
            AnswerEvaluation eval = manager.submitAnswer(answer, timeSpent);
            showEvaluationModal(eval);
        } catch (EmptyAnswerException ex) {
            // Restart timer or resume
            JOptionPane.showMessageDialog(this, ex.getMessage(), "Empty Answer Warning", JOptionPane.WARNING_MESSAGE);
            if (countdownTimer != null && !countdownTimer.isRunning()) {
                countdownTimer.start();
            }
        }
    }

    private void autoSubmitOnTimeout() {
        String answer = answerArea.getText().trim();
        if (answer.isEmpty()) {
            AnswerEvaluation eval = manager.skipCurrentQuestion();
            showEvaluationModal(eval);
        } else {
            try {
                AnswerEvaluation eval = manager.submitAnswer(answer, QUESTION_TIME_LIMIT);
                showEvaluationModal(eval);
            } catch (EmptyAnswerException ex) {
                AnswerEvaluation eval = manager.skipCurrentQuestion();
                showEvaluationModal(eval);
            }
        }
    }

    private void handleSkip(ActionEvent e) {
        int confirm = JOptionPane.showConfirmDialog(this,
                "Skipping will award 0 points for this question. Do you wish to continue?",
                "Skip Confirmation", JOptionPane.YES_NO_OPTION);
        if (confirm == JOptionPane.YES_OPTION) {
            stopTimer();
            AnswerEvaluation eval = manager.skipCurrentQuestion();
            showEvaluationModal(eval);
        }
    }

    private void showEvaluationModal(AnswerEvaluation eval) {
        JDialog dialog = new JDialog(this, "Question Evaluation Feedback", true);
        dialog.setSize(520, 360);
        dialog.setLocationRelativeTo(this);
        dialog.setResizable(false);

        JPanel panel = new JPanel();
        panel.setBackground(UITheme.CARD_BG);
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBorder(new EmptyBorder(20, 25, 20, 25));

        JLabel title = new JLabel("Question Evaluation Diagnostic");
        title.setFont(UITheme.FONT_SUBTITLE);
        title.setForeground(UITheme.PRIMARY);

        JLabel scoreLbl = new JLabel("Score: " + eval.getScore() + "%");
        scoreLbl.setFont(new Font("Segoe UI", Font.BOLD, 24));
        scoreLbl.setForeground(eval.getScore() >= 60 ? UITheme.SUCCESS : UITheme.DANGER);

        JLabel matched = new JLabel("<html><b>Matched Keywords:</b> " +
                (eval.getMatchedKeywords().isEmpty() ? "None" : String.join(", ", eval.getMatchedKeywords())) + "</html>");
        matched.setFont(UITheme.FONT_BODY);
        matched.setForeground(UITheme.SUCCESS);

        JLabel missed = new JLabel("<html><b>Missed Concepts:</b> " +
                (eval.getMissedKeywords().isEmpty() ? "None" : String.join(", ", eval.getMissedKeywords())) + "</html>");
        missed.setFont(UITheme.FONT_BODY);
        missed.setForeground(UITheme.WARNING);

        JLabel feedback = new JLabel("<html><b>Evaluator Feedback:</b> " + eval.getFeedback() + "</html>");
        feedback.setFont(UITheme.FONT_BODY);
        feedback.setForeground(UITheme.TEXT_PRIMARY);

        JButton nextBtn = UITheme.createPrimaryButton("Proceed to Next Question ➔");
        nextBtn.setMaximumSize(new Dimension(Integer.MAX_VALUE, 40));
        nextBtn.setAlignmentX(Component.LEFT_ALIGNMENT);
        nextBtn.addActionListener(evt -> {
            dialog.dispose();
            loadCurrentQuestion();
        });

        panel.add(title);
        panel.add(Box.createVerticalStrut(10));
        panel.add(scoreLbl);
        panel.add(Box.createVerticalStrut(12));
        panel.add(matched);
        panel.add(Box.createVerticalStrut(8));
        panel.add(missed);
        panel.add(Box.createVerticalStrut(10));
        panel.add(feedback);
        panel.add(Box.createVerticalStrut(20));
        panel.add(nextBtn);

        dialog.setContentPane(panel);
        dialog.setVisible(true);
    }

    private void finishInterviewSession() {
        stopTimer();
        progressBar.setValue(activeInterview.getTotalQuestionsCount());
        var report = manager.finishInterview();
        dispose();

        ResultScreen resultScreen = new ResultScreen(dashboard, report, manager);
        resultScreen.setVisible(true);
    }
}
