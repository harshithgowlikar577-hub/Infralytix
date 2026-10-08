package gui;

import model.AssessmentSessionReport;
import model.MCQEvaluation;
import util.UITheme;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;
import java.util.List;

/**
 * ReviewAnswersScreen - Shows all questions and correct/wrong answers side by side.
 */
public class ReviewAnswersScreen extends JFrame {

    private AssessmentSessionReport report;
    private List<MCQEvaluation> evaluations;
    private int currentIndex = 0;

    private JLabel qNumLbl, statusBadge, marksBadge;
    private JTextArea questionArea;
    private JLabel[] optionLabels = new JLabel[4];
    private JButton prevBtn, nextBtn;

    public ReviewAnswersScreen(AssessmentSessionReport report) {
        this.report = report;
        this.evaluations = report.getEvaluations();

        setTitle("Review Answers - " + report.getDomain());
        setSize(920, 640);
        setMinimumSize(new Dimension(780, 540));
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);
        getContentPane().setBackground(UITheme.BG_DARK);
        setLayout(new BorderLayout());
        initUI();
        if (!evaluations.isEmpty()) renderQuestion(0);
    }

    private void initUI() {
        // Header
        JPanel header = new JPanel(new BorderLayout(14, 0));
        header.setBackground(UITheme.BG_CARD);
        header.setBorder(new EmptyBorder(16, 24, 16, 24));

        qNumLbl = new JLabel("Question 1 of " + evaluations.size(), SwingConstants.LEFT);
        qNumLbl.setFont(UITheme.FONT_TITLE);
        qNumLbl.setForeground(UITheme.TEXT_PRIMARY);
        header.add(qNumLbl, BorderLayout.WEST);

        JPanel badges = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        badges.setOpaque(false);
        statusBadge = new JLabel("  STATUS  ");
        statusBadge.setFont(UITheme.FONT_BOLD);
        statusBadge.setForeground(Color.WHITE);
        statusBadge.setOpaque(true);
        statusBadge.setBackground(UITheme.PRIMARY);
        statusBadge.setBorder(new EmptyBorder(5, 12, 5, 12));
        marksBadge = new JLabel("  +1.00  ");
        marksBadge.setFont(UITheme.FONT_BOLD);
        marksBadge.setForeground(Color.WHITE);
        marksBadge.setOpaque(true);
        marksBadge.setBackground(UITheme.SUCCESS);
        marksBadge.setBorder(new EmptyBorder(5, 12, 5, 12));
        badges.add(statusBadge);
        badges.add(marksBadge);
        header.add(badges, BorderLayout.EAST);
        add(header, BorderLayout.NORTH);

        // Center
        JPanel center = new JPanel();
        center.setLayout(new BoxLayout(center, BoxLayout.Y_AXIS));
        center.setBackground(UITheme.BG_DARK);
        center.setBorder(new EmptyBorder(18, 28, 10, 28));

        // Question card
        JPanel qCard = new JPanel(new BorderLayout());
        qCard.setBackground(UITheme.BG_CARD);
        qCard.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.BORDER_COLOR, 1, true), new EmptyBorder(18, 20, 18, 20)));
        qCard.setMaximumSize(new Dimension(Short.MAX_VALUE, 180));

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
        qCard.add(qScroll, BorderLayout.CENTER);
        center.add(qCard);
        center.add(Box.createVerticalStrut(16));

        // Options (read-only, colored)
        JPanel optsPanel = new JPanel(new GridLayout(4, 1, 0, 10));
        optsPanel.setOpaque(false);
        optsPanel.setMaximumSize(new Dimension(Short.MAX_VALUE, 260));
        char[] letters = {'A', 'B', 'C', 'D'};
        for (int i = 0; i < 4; i++) {
            JPanel optCard = new JPanel(new BorderLayout(14, 0));
            optCard.setBackground(UITheme.BG_CARD);
            optCard.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(UITheme.BORDER_COLOR, 1, true), new EmptyBorder(12, 14, 12, 14)));

            JLabel letterLbl = new JLabel(String.valueOf(letters[i]), SwingConstants.CENTER);
            letterLbl.setFont(new Font("Segoe UI", Font.BOLD, 14));
            letterLbl.setForeground(UITheme.TEXT_SECONDARY);
            letterLbl.setOpaque(true);
            letterLbl.setBackground(UITheme.BG_CARD_ALT);
            letterLbl.setPreferredSize(new Dimension(36, 36));
            letterLbl.setBorder(BorderFactory.createLineBorder(UITheme.BORDER_COLOR, 1));

            JLabel textLbl = new JLabel("", SwingConstants.LEFT);
            textLbl.setFont(UITheme.FONT_OPTION);
            textLbl.setForeground(UITheme.TEXT_PRIMARY);
            optionLabels[i] = textLbl;

            optCard.add(letterLbl, BorderLayout.WEST);
            optCard.add(textLbl, BorderLayout.CENTER);
            optsPanel.add(optCard);
        }
        center.add(optsPanel);

        JScrollPane scrollPane = new JScrollPane(center);
        scrollPane.setBorder(null);
        scrollPane.setBackground(UITheme.BG_DARK);
        scrollPane.getViewport().setBackground(UITheme.BG_DARK);
        add(scrollPane, BorderLayout.CENTER);

        // Nav buttons
        JPanel nav = new JPanel(new BorderLayout());
        nav.setBackground(UITheme.BG_CARD);
        nav.setBorder(new EmptyBorder(12, 24, 12, 24));

        prevBtn = UITheme.createSecondaryButton("  Previous  ");
        prevBtn.addActionListener(e -> { if (currentIndex > 0) renderQuestion(--currentIndex); });

        nextBtn = UITheme.createPrimaryButton("  Next  ");
        nextBtn.addActionListener(e -> { if (currentIndex < evaluations.size()-1) renderQuestion(++currentIndex); });

        JPanel navBtns = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 0));
        navBtns.setOpaque(false);
        navBtns.add(prevBtn);
        navBtns.add(nextBtn);

        JButton closeBtn = UITheme.createDangerButton("  Close  ");
        closeBtn.setFont(UITheme.FONT_SMALL);
        closeBtn.addActionListener(e -> dispose());

        nav.add(closeBtn, BorderLayout.WEST);
        nav.add(navBtns, BorderLayout.EAST);
        add(nav, BorderLayout.SOUTH);
    }

    private void renderQuestion(int idx) {
        currentIndex = idx;
        MCQEvaluation eval = evaluations.get(idx);
        qNumLbl.setText("Question " + (idx + 1) + " of " + evaluations.size() +
            "    |    Topic: " + eval.getTopic() + "  [" + eval.getDifficulty() + "]");

        String status = eval.getStatus();
        switch (status) {
            case "CORRECT" -> { statusBadge.setText("  CORRECT  "); statusBadge.setBackground(UITheme.SUCCESS); }
            case "WRONG"   -> { statusBadge.setText("  WRONG  ");   statusBadge.setBackground(UITheme.DANGER); }
            default        -> { statusBadge.setText("  SKIPPED  "); statusBadge.setBackground(UITheme.TEXT_MUTED); }
        }

        double marks = eval.getMarksAwarded();
        marksBadge.setText(String.format("  %+.2f marks  ", marks));
        marksBadge.setBackground(marks > 0 ? UITheme.SUCCESS : marks < 0 ? UITheme.DANGER : UITheme.BG_CARD_ALT);

        if (eval.hasCodeSnippet()) {
            questionArea.setFont(UITheme.FONT_CODE);
            questionArea.setBackground(new Color(10, 15, 28));
        } else {
            questionArea.setFont(UITheme.FONT_REGULAR);
            questionArea.setBackground(UITheme.BG_CARD);
        }
        questionArea.setText(eval.getFormattedQuestionText());
        questionArea.setCaretPosition(0);

        String[] opts = {eval.getOptionA(), eval.getOptionB(), eval.getOptionC(), eval.getOptionD()};
        char correct  = eval.getCorrectAnswer();
        char chosen   = eval.getChosenAnswer();
        char[] letters = {'A', 'B', 'C', 'D'};

        for (int i = 0; i < 4; i++) {
            char l = letters[i];
            optionLabels[i].setText("<html><body style='width:650px;'>" + opts[i] + "</body></html>");
            JPanel card = (JPanel) optionLabels[i].getParent();
            Component letterComp = card.getComponent(0);

            if (l == correct) {
                card.setBackground(new Color(15, 50, 30));
                card.setBorder(BorderFactory.createCompoundBorder(
                    new LineBorder(UITheme.SUCCESS, 2, true), new EmptyBorder(11, 13, 11, 13)));
                optionLabels[i].setForeground(UITheme.SUCCESS);
                if (letterComp instanceof JLabel ll) { ll.setBackground(UITheme.SUCCESS_DARK); ll.setForeground(UITheme.SUCCESS); }
            } else if (l == chosen && chosen != correct) {
                card.setBackground(new Color(50, 15, 15));
                card.setBorder(BorderFactory.createCompoundBorder(
                    new LineBorder(UITheme.DANGER, 2, true), new EmptyBorder(11, 13, 11, 13)));
                optionLabels[i].setForeground(UITheme.DANGER);
                if (letterComp instanceof JLabel ll) { ll.setBackground(UITheme.DANGER_DARK); ll.setForeground(UITheme.DANGER); }
            } else {
                card.setBackground(UITheme.BG_CARD);
                card.setBorder(BorderFactory.createCompoundBorder(
                    new LineBorder(UITheme.BORDER_COLOR, 1, true), new EmptyBorder(12, 14, 12, 14)));
                optionLabels[i].setForeground(UITheme.TEXT_PRIMARY);
                if (letterComp instanceof JLabel ll) { ll.setBackground(UITheme.BG_CARD_ALT); ll.setForeground(UITheme.TEXT_SECONDARY); }
            }
        }

        prevBtn.setEnabled(idx > 0);
        nextBtn.setEnabled(idx < evaluations.size() - 1);

        // Explanation panel
        String expl = eval.getExplanation();
        if (expl != null && !expl.isEmpty()) {
            qNumLbl.setToolTipText("Explanation: " + expl);
        }
    }
}
