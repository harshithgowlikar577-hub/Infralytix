package gui;

import model.Assessment;
import model.AssessmentSessionReport;
import model.Candidate;
import model.MCQEvaluation;
import model.Question;
import service.AssessmentManager;
import util.UITheme;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;

/**
 * MCQ Assessment Screen - Premium question interface with timer, code snippets, and option cards.
 */
public class MCQAssessmentScreen extends JFrame {

    private MainDashboard dashboard;
    private Candidate candidate;
    private AssessmentManager manager;
    private Assessment activeAssessment;

    // Header area
    private JLabel progressLbl, difficultyBadge, scoreLbl;
    private JProgressBar progressBar;

    // Timer
    private JLabel timerLbl;
    private JProgressBar timerBar;
    private Timer timer;
    private int secondsRemaining;
    private int questionTimeSpent;

    // Question area
    private JTextArea questionArea;

    // Option panels (the full clickable card)
    private JPanel[] optionCards = new JPanel[4];
    private JLabel[] optionLetterLabels = new JLabel[4];
    private JLabel[] optionTextLabels = new JLabel[4];
    private char selectedOption = 'S'; // S = no selection
    private final char[] LETTERS = {'A', 'B', 'C', 'D'};

    // Scoring running totals
    private double runningScore = 0.0;
    private int correct = 0, wrong = 0, skipped = 0;

    public MCQAssessmentScreen(MainDashboard dashboard, Candidate candidate,
                               AssessmentManager manager, Assessment activeAssessment) {
        this.dashboard = dashboard;
        this.candidate = candidate;
        this.manager = manager;
        this.activeAssessment = activeAssessment;

        setTitle("AI Placement Simulator - Assessment in Progress");
        setSize(1000, 720);
        setMinimumSize(new Dimension(850, 600));
        setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        setLocationRelativeTo(null);
        getContentPane().setBackground(UITheme.BG_DARK);
        setLayout(new BorderLayout());

        initUI();
        setupKeyBindings();
        loadCurrentQuestion();
    }

    private void initUI() {
        add(buildHeader(), BorderLayout.NORTH);
        add(buildCenterPanel(), BorderLayout.CENTER);
        add(buildBottomBar(), BorderLayout.SOUTH);
    }

    // ---- HEADER ----
    private JPanel buildHeader() {
        JPanel header = new JPanel(new BorderLayout(12, 0));
        header.setBackground(UITheme.BG_HEADER);
        header.setBorder(new EmptyBorder(14, 24, 14, 24));

        progressLbl = new JLabel("Loading...");
        progressLbl.setFont(UITheme.FONT_BOLD);
        progressLbl.setForeground(UITheme.TEXT_PRIMARY);

        JPanel leftSection = new JPanel(new GridLayout(2, 1, 0, 4));
        leftSection.setOpaque(false);
        leftSection.add(progressLbl);

        progressBar = UITheme.createProgressBar(0, Math.max(activeAssessment.getTotalQuestions(), 1), UITheme.PRIMARY);
        progressBar.setPreferredSize(new Dimension(0, 8));
        leftSection.add(progressBar);
        header.add(leftSection, BorderLayout.CENTER);

        JPanel rightSection = new JPanel(new FlowLayout(FlowLayout.RIGHT, 16, 0));
        rightSection.setOpaque(false);

        difficultyBadge = new JLabel("  EASY  ");
        difficultyBadge.setFont(UITheme.FONT_BOLD);
        difficultyBadge.setForeground(Color.WHITE);
        difficultyBadge.setOpaque(true);
        difficultyBadge.setBackground(UITheme.SUCCESS);
        difficultyBadge.setBorder(new EmptyBorder(4, 10, 4, 10));

        scoreLbl = new JLabel("Score: 0.00");
        scoreLbl.setFont(UITheme.FONT_BOLD);
        scoreLbl.setForeground(UITheme.TEXT_PRIMARY);

        timerLbl = new JLabel("00:30");
        timerLbl.setFont(new Font("Consolas", Font.BOLD, 22));
        timerLbl.setForeground(UITheme.SUCCESS);

        rightSection.add(scoreLbl);
        rightSection.add(difficultyBadge);
        rightSection.add(timerLbl);
        header.add(rightSection, BorderLayout.EAST);

        // Timer progress bar strip
        timerBar = UITheme.createProgressBar(0, 30, UITheme.SUCCESS);
        timerBar.setPreferredSize(new Dimension(0, 5));
        timerBar.setValue(30);

        JPanel headerWrap = new JPanel(new BorderLayout());
        headerWrap.setOpaque(false);
        headerWrap.add(header, BorderLayout.CENTER);
        headerWrap.add(timerBar, BorderLayout.SOUTH);
        return headerWrap;
    }

    // ---- CENTER PANEL ----
    private JPanel buildCenterPanel() {
        JPanel center = new JPanel(new BorderLayout(0, 14));
        center.setBackground(UITheme.BG_DARK);
        center.setBorder(new EmptyBorder(18, 28, 10, 28));

        // Question card
        JPanel qCard = new JPanel(new BorderLayout());
        qCard.setBackground(UITheme.BG_CARD);
        qCard.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.BORDER_COLOR, 1, true),
            new EmptyBorder(20, 22, 20, 22)
        ));

        questionArea = new JTextArea();
        questionArea.setFont(UITheme.FONT_REGULAR);
        questionArea.setForeground(UITheme.TEXT_PRIMARY);
        questionArea.setBackground(UITheme.BG_CARD);
        questionArea.setEditable(false);
        questionArea.setLineWrap(true);
        questionArea.setWrapStyleWord(true);
        questionArea.setBorder(null);
        JScrollPane qScroll = new JScrollPane(questionArea);
        qScroll.setBorder(null);
        qScroll.setBackground(UITheme.BG_CARD);
        qScroll.getViewport().setBackground(UITheme.BG_CARD);
        qScroll.setPreferredSize(new Dimension(0, 160));
        qCard.add(qScroll, BorderLayout.CENTER);
        center.add(qCard, BorderLayout.NORTH);

        // Options panel
        JPanel optionsPanel = new JPanel(new GridLayout(4, 1, 0, 10));
        optionsPanel.setOpaque(false);

        for (int i = 0; i < 4; i++) {
            optionCards[i] = buildOptionCard(i);
            optionsPanel.add(optionCards[i]);
        }
        center.add(optionsPanel, BorderLayout.CENTER);

        JScrollPane scroll = new JScrollPane(center);
        scroll.setBorder(null);
        scroll.setBackground(UITheme.BG_DARK);
        scroll.getViewport().setBackground(UITheme.BG_DARK);

        JPanel wrapper = new JPanel(new BorderLayout());
        wrapper.setBackground(UITheme.BG_DARK);
        wrapper.add(center, BorderLayout.CENTER);
        return wrapper;
    }

    private JPanel buildOptionCard(int idx) {
        char letter = LETTERS[idx];

        JPanel card = new JPanel(new BorderLayout(14, 0));
        card.setBackground(UITheme.BG_CARD);
        card.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.BORDER_COLOR, 1, true),
            new EmptyBorder(14, 16, 14, 16)
        ));
        card.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));

        // Letter badge
        JLabel letterLbl = new JLabel(String.valueOf(letter), SwingConstants.CENTER);
        letterLbl.setFont(new Font("Segoe UI", Font.BOLD, 14));
        letterLbl.setForeground(UITheme.TEXT_SECONDARY);
        letterLbl.setOpaque(true);
        letterLbl.setBackground(UITheme.BG_CARD_ALT);
        letterLbl.setPreferredSize(new Dimension(36, 36));
        letterLbl.setBorder(BorderFactory.createLineBorder(UITheme.BORDER_COLOR, 1));
        optionLetterLabels[idx] = letterLbl;
        card.add(letterLbl, BorderLayout.WEST);

        // Option text
        JLabel textLbl = new JLabel("", SwingConstants.LEFT);
        textLbl.setFont(UITheme.FONT_OPTION);
        textLbl.setForeground(UITheme.TEXT_PRIMARY);
        optionTextLabels[idx] = textLbl;
        card.add(textLbl, BorderLayout.CENTER);

        // Keyboard shortcut hint
        JLabel shortcutHint = new JLabel("[" + letter + "]");
        shortcutHint.setFont(UITheme.FONT_TINY);
        shortcutHint.setForeground(UITheme.TEXT_DISABLED);
        card.add(shortcutHint, BorderLayout.EAST);

        // Mouse interaction
        card.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent e) { selectOption(idx); }
            public void mouseEntered(java.awt.event.MouseEvent e) {
                if (selectedOption != letter) {
                    card.setBackground(new Color(40, 55, 78));
                    card.setBorder(BorderFactory.createCompoundBorder(
                        new LineBorder(new Color(71, 85, 105), 1, true),
                        new EmptyBorder(14, 16, 14, 16)
                    ));
                }
            }
            public void mouseExited(java.awt.event.MouseEvent e) {
                if (selectedOption != letter) {
                    card.setBackground(UITheme.BG_CARD);
                    card.setBorder(BorderFactory.createCompoundBorder(
                        new LineBorder(UITheme.BORDER_COLOR, 1, true),
                        new EmptyBorder(14, 16, 14, 16)
                    ));
                }
            }
        });
        return card;
    }

    private void selectOption(int idx) {
        // Deselect previous
        for (int i = 0; i < 4; i++) {
            optionCards[i].setBackground(UITheme.BG_CARD);
            optionCards[i].setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(UITheme.BORDER_COLOR, 1, true),
                new EmptyBorder(14, 16, 14, 16)
            ));
            optionLetterLabels[i].setBackground(UITheme.BG_CARD_ALT);
            optionLetterLabels[i].setForeground(UITheme.TEXT_SECONDARY);
            optionTextLabels[i].setForeground(UITheme.TEXT_PRIMARY);
        }
        // Select new
        selectedOption = LETTERS[idx];
        optionCards[idx].setBackground(new Color(23, 55, 100));
        optionCards[idx].setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.PRIMARY, 2, true),
            new EmptyBorder(13, 15, 13, 15)
        ));
        optionLetterLabels[idx].setBackground(UITheme.PRIMARY);
        optionLetterLabels[idx].setForeground(Color.WHITE);
        optionTextLabels[idx].setForeground(UITheme.PRIMARY_LIGHT);
    }

    // ---- BOTTOM BAR ----
    private JPanel buildBottomBar() {
        JPanel bar = new JPanel(new BorderLayout(14, 0));
        bar.setBackground(UITheme.BG_CARD);
        bar.setBorder(new EmptyBorder(14, 24, 14, 24));

        // Left: scoring info
        JPanel scoreInfo = new JPanel(new FlowLayout(FlowLayout.LEFT, 20, 0));
        scoreInfo.setOpaque(false);
        JLabel correctInfoLbl = new JLabel("+1.00  Correct");
        correctInfoLbl.setFont(UITheme.FONT_SMALL);
        correctInfoLbl.setForeground(UITheme.SUCCESS);
        JLabel wrongInfoLbl = new JLabel("-0.25  Wrong");
        wrongInfoLbl.setFont(UITheme.FONT_SMALL);
        wrongInfoLbl.setForeground(UITheme.DANGER);
        JLabel skipInfoLbl = new JLabel("0.00  Skip");
        skipInfoLbl.setFont(UITheme.FONT_SMALL);
        skipInfoLbl.setForeground(UITheme.TEXT_MUTED);
        JLabel shortcutsLbl = new JLabel("  Keys: A/B/C/D = Select  |  Space = Skip  |  Enter = Submit");
        shortcutsLbl.setFont(UITheme.FONT_TINY);
        shortcutsLbl.setForeground(UITheme.TEXT_DISABLED);
        scoreInfo.add(correctInfoLbl);
        scoreInfo.add(wrongInfoLbl);
        scoreInfo.add(skipInfoLbl);
        scoreInfo.add(shortcutsLbl);
        bar.add(scoreInfo, BorderLayout.WEST);

        // Right: action buttons
        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        actionPanel.setOpaque(false);

        JButton abortBtn = UITheme.createDangerButton("  Abort  ");
        abortBtn.setFont(UITheme.FONT_SMALL);
        abortBtn.setBorder(new EmptyBorder(9, 16, 9, 16));
        abortBtn.addActionListener(this::handleAbort);

        JButton skipBtn = UITheme.createSecondaryButton("  Skip  ");
        skipBtn.setFont(UITheme.FONT_SMALL);
        skipBtn.setBorder(new EmptyBorder(9, 16, 9, 16));
        skipBtn.addActionListener(e -> processAnswer(true));

        JButton submitBtn = UITheme.createPrimaryButton("  Submit  ");
        submitBtn.setFont(UITheme.FONT_BOLD);
        submitBtn.setBorder(new EmptyBorder(9, 20, 9, 20));
        submitBtn.addActionListener(e -> processAnswer(false));

        actionPanel.add(abortBtn);
        actionPanel.add(skipBtn);
        actionPanel.add(submitBtn);
        bar.add(actionPanel, BorderLayout.EAST);
        return bar;
    }

    // ---- QUESTION LOADING ----
    private void loadCurrentQuestion() {
        Question q = activeAssessment.getCurrentQuestion();
        if (q == null) { finishAssessment(); return; }

        int qNum = activeAssessment.getCurrentIndex() + 1;
        int total = activeAssessment.getTotalQuestions();
        progressLbl.setText("Question  " + qNum + " / " + total + "   |   " + q.getDomain() + "  >  " + q.getTopic());
        progressBar.setMaximum(total);
        progressBar.setValue(qNum);

        String diff = activeAssessment.getCurrentDifficulty();
        difficultyBadge.setText("  " + diff.toUpperCase() + "  ");
        switch (diff.toUpperCase()) {
            case "EASY"   -> { difficultyBadge.setBackground(UITheme.SUCCESS); }
            case "MEDIUM" -> { difficultyBadge.setBackground(UITheme.WARNING); }
            case "HARD"   -> { difficultyBadge.setBackground(UITheme.DANGER); }
        }

        scoreLbl.setText(String.format("Score: %.2f  |  +%d  -%d  =%d", runningScore, correct, wrong, skipped));

        // Load question text
        if (q.hasCodeSnippet()) {
            questionArea.setFont(UITheme.FONT_CODE);
            questionArea.setBackground(new Color(10, 15, 28));
        } else {
            questionArea.setFont(UITheme.FONT_REGULAR);
            questionArea.setBackground(UITheme.BG_CARD);
        }
        questionArea.setText(q.getFormattedQuestionText());
        questionArea.setCaretPosition(0);

        // Load options
        String[] opts = {q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()};
        for (int i = 0; i < 4; i++) {
            optionTextLabels[i].setText("<html><body style='width:700px;'>" + opts[i] + "</body></html>");
        }

        // Reset selection
        selectedOption = 'S';
        for (int i = 0; i < 4; i++) {
            optionCards[i].setBackground(UITheme.BG_CARD);
            optionCards[i].setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(UITheme.BORDER_COLOR, 1, true), new EmptyBorder(14, 16, 14, 16)));
            optionLetterLabels[i].setBackground(UITheme.BG_CARD_ALT);
            optionLetterLabels[i].setForeground(UITheme.TEXT_SECONDARY);
            optionTextLabels[i].setForeground(UITheme.TEXT_PRIMARY);
        }

        startQuestionTimer();
    }

    // ---- TIMER ----
    private void startQuestionTimer() {
        if (timer != null && timer.isRunning()) timer.stop();
        secondsRemaining = activeAssessment.getTimeLimitPerQuestion();
        questionTimeSpent = 0;
        timerBar.setMaximum(secondsRemaining);
        updateTimerDisplay();
        timer = new Timer(1000, e -> {
            secondsRemaining--;
            questionTimeSpent++;
            updateTimerDisplay();
            if (secondsRemaining <= 0) { timer.stop(); handleTimeout(); }
        });
        timer.start();
    }

    private void updateTimerDisplay() {
        timerLbl.setText(String.format("00:%02d", Math.max(0, secondsRemaining)));
        timerBar.setValue(Math.max(0, secondsRemaining));
        if (secondsRemaining <= 5) {
            timerLbl.setForeground(UITheme.DANGER);
            timerBar.setForeground(UITheme.DANGER);
        } else if (secondsRemaining <= 10) {
            timerLbl.setForeground(UITheme.WARNING);
            timerBar.setForeground(UITheme.WARNING);
        } else {
            timerLbl.setForeground(UITheme.SUCCESS);
            timerBar.setForeground(UITheme.SUCCESS);
        }
    }

    private void handleTimeout() {
        if (selectedOption == 'S') {
            activeAssessment.skipQuestion(questionTimeSpent);
            skipped++;
        } else {
            MCQEvaluation result = activeAssessment.submitAnswer(selectedOption, questionTimeSpent);
            if (result != null && "CORRECT".equals(result.getStatus())) {
                correct++;
                runningScore += 1.0;
            } else {
                wrong++;
                runningScore -= 0.25;
            }
        }
        advanceToNext();
    }

    // ---- ANSWER PROCESSING ----
    private void processAnswer(boolean isSkip) {
        if (timer != null) timer.stop();
        if (isSkip) {
            activeAssessment.skipQuestion(questionTimeSpent);
            skipped++;
        } else {
            if (selectedOption == 'S') {
                int res = JOptionPane.showConfirmDialog(this,
                    "No option selected!\n\nDo you want to SKIP this question? (0 marks, no penalty)",
                    "Confirm Skip", JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE);
                if (res == JOptionPane.YES_OPTION) {
                    activeAssessment.skipQuestion(questionTimeSpent);
                    skipped++;
                } else {
                    timer.start();
                    return;
                }
            } else {
                MCQEvaluation result = activeAssessment.submitAnswer(selectedOption, questionTimeSpent);
                if (result != null && "CORRECT".equals(result.getStatus())) {
                    correct++;
                    runningScore += 1.0;
                } else {
                    wrong++;
                    runningScore -= 0.25;
                }
            }
        }
        advanceToNext();
    }

    private void advanceToNext() {
        activeAssessment.moveToNextQuestion();
        if (activeAssessment.hasNextQuestion()) loadCurrentQuestion();
        else finishAssessment();
    }

    private void finishAssessment() {
        if (timer != null) timer.stop();
        AssessmentSessionReport report = manager.finalizeAssessment(activeAssessment, candidate);
        new ResultScreen(dashboard, candidate, manager, report).setVisible(true);
        this.dispose();
    }

    private void handleAbort(ActionEvent e) {
        if (timer != null) timer.stop();
        int res = JOptionPane.showConfirmDialog(this,
            "Are you sure you want to abort this assessment?\n\nAll progress for this session will be lost.",
            "Abort Assessment", JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE);
        if (res == JOptionPane.YES_OPTION) { dashboard.setVisible(true); this.dispose(); }
        else if (timer != null && !timer.isRunning()) timer.start();
    }

    private void setupKeyBindings() {
        InputMap im = getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
        ActionMap am = getRootPane().getActionMap();
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_A, 0), "optA");
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_1, 0), "optA");
        am.put("optA", new AbstractAction() { public void actionPerformed(ActionEvent e) { selectOption(0); } });
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_B, 0), "optB");
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_2, 0), "optB");
        am.put("optB", new AbstractAction() { public void actionPerformed(ActionEvent e) { selectOption(1); } });
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_C, 0), "optC");
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_3, 0), "optC");
        am.put("optC", new AbstractAction() { public void actionPerformed(ActionEvent e) { selectOption(2); } });
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_D, 0), "optD");
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_4, 0), "optD");
        am.put("optD", new AbstractAction() { public void actionPerformed(ActionEvent e) { selectOption(3); } });
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_ENTER, 0), "submit");
        am.put("submit", new AbstractAction() { public void actionPerformed(ActionEvent e) { processAnswer(false); } });
        im.put(KeyStroke.getKeyStroke(KeyEvent.VK_SPACE, 0), "skip");
        am.put("skip", new AbstractAction() { public void actionPerformed(ActionEvent e) { processAnswer(true); } });
    }
}
