package gui;

import model.AssessmentSessionReport;
import model.Candidate;
import service.AssessmentManager;
import util.UITheme;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;
import java.awt.geom.Arc2D;
import java.awt.geom.Ellipse2D;
import java.util.List;

/**
 * Result Screen - Detailed post-assessment scorecard with visual performance ring.
 */
public class ResultScreen extends JFrame {

    private MainDashboard dashboard;
    private Candidate candidate;
    private AssessmentManager manager;
    private AssessmentSessionReport report;

    public ResultScreen(MainDashboard dashboard, Candidate candidate,
                        AssessmentManager manager, AssessmentSessionReport report) {
        this.dashboard = dashboard;
        this.candidate = candidate;
        this.manager = manager;
        this.report = report;

        setTitle("AI Placement Simulator - Assessment Result");
        setSize(900, 700);
        setMinimumSize(new Dimension(780, 580));
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);
        getContentPane().setBackground(UITheme.BG_DARK);
        setLayout(new BorderLayout());
        initUI();
    }

    private void initUI() {
        // Header
        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(UITheme.BG_CARD);
        header.setBorder(new EmptyBorder(18, 24, 18, 24));

        JLabel titleLbl = new JLabel("Assessment Complete!", SwingConstants.LEFT);
        titleLbl.setFont(UITheme.FONT_HEADER_LARGE);
        titleLbl.setForeground(UITheme.TEXT_PRIMARY);

        JLabel subLbl = new JLabel(report.getDomain() + "  |  " + report.getTimestamp(), SwingConstants.LEFT);
        subLbl.setFont(UITheme.FONT_SMALL);
        subLbl.setForeground(UITheme.TEXT_MUTED);

        JPanel hText = new JPanel(new GridLayout(2, 1, 0, 5));
        hText.setOpaque(false);
        hText.add(titleLbl);
        hText.add(subLbl);
        header.add(hText, BorderLayout.WEST);

        // Grade badge
        String grade = getGrade(report.getPercentageScore());
        JLabel gradeLbl = new JLabel("  " + grade + "  ");
        gradeLbl.setFont(new Font("Segoe UI", Font.BOLD, 28));
        gradeLbl.setForeground(Color.WHITE);
        gradeLbl.setOpaque(true);
        gradeLbl.setBackground(getGradeColor(grade));
        gradeLbl.setBorder(new EmptyBorder(8, 16, 8, 16));
        gradeLbl.setHorizontalAlignment(SwingConstants.CENTER);
        header.add(gradeLbl, BorderLayout.EAST);
        add(header, BorderLayout.NORTH);

        // Main content - split into visual ring left, stats right
        JPanel content = new JPanel(new BorderLayout(20, 0));
        content.setBackground(UITheme.BG_DARK);
        content.setBorder(new EmptyBorder(22, 28, 12, 28));

        // Score ring visual
        int correct  = report.getCorrectCount();
        int wrong    = report.getWrongCount();
        int skipped  = report.getSkippedCount();
        int total    = report.getTotalQuestions();
        double pct   = report.getPercentageScore();

        JPanel ringPanel = new JPanel(new BorderLayout(0, 14)) {
            @Override protected void paintComponent(Graphics g) {
                super.paintComponent(g);
            }
        };
        ringPanel.setBackground(UITheme.BG_DARK);
        ringPanel.setPreferredSize(new Dimension(280, 0));

        ScoreRingCanvas ring = new ScoreRingCanvas(correct, wrong, skipped, total);
        ring.setPreferredSize(new Dimension(240, 240));
        JPanel ringWrapper = new JPanel(new FlowLayout(FlowLayout.CENTER));
        ringWrapper.setOpaque(false);
        ringWrapper.add(ring);
        ringPanel.add(ringWrapper, BorderLayout.CENTER);

        // Legend
        JPanel legend = new JPanel(new GridLayout(3, 1, 0, 8));
        legend.setOpaque(false);
        legend.add(buildLegendRow("Correct", correct, UITheme.SUCCESS));
        legend.add(buildLegendRow("Incorrect", wrong, UITheme.DANGER));
        legend.add(buildLegendRow("Skipped", skipped, UITheme.TEXT_MUTED));
        ringPanel.add(legend, BorderLayout.SOUTH);
        content.add(ringPanel, BorderLayout.WEST);

        // Stats column
        JPanel statsPanel = new JPanel();
        statsPanel.setLayout(new BoxLayout(statsPanel, BoxLayout.Y_AXIS));
        statsPanel.setOpaque(false);

        // Score cards row 1
        JPanel row1 = new JPanel(new GridLayout(1, 3, 12, 12));
        row1.setOpaque(false);
        row1.setMaximumSize(new Dimension(Short.MAX_VALUE, 90));
        row1.add(UITheme.createStatCard("Net Score", String.format("%.2f", report.getNetScore()), UITheme.PRIMARY));
        row1.add(UITheme.createStatCard("Percentage", String.format("%.1f%%", pct), getGradeColor(grade)));
        row1.add(UITheme.createStatCard("Percentile", String.format("%.1f%%", report.getPlacementPercentile()), UITheme.ACCENT_CYAN));
        statsPanel.add(row1);
        statsPanel.add(Box.createVerticalStrut(12));

        // Score cards row 2
        JPanel row2 = new JPanel(new GridLayout(1, 3, 12, 12));
        row2.setOpaque(false);
        row2.setMaximumSize(new Dimension(Short.MAX_VALUE, 90));
        row2.add(UITheme.createStatCard("Questions", String.valueOf(total), UITheme.TEXT_SECONDARY));
        row2.add(UITheme.createStatCard("XP Earned", "+" + report.getXpEarned() + " XP", UITheme.WARNING));
        row2.add(UITheme.createStatCard("Difficulty", report.getDifficultyMode(), UITheme.ACCENT_PURPLE));
        statsPanel.add(row2);
        statsPanel.add(Box.createVerticalStrut(16));

        // Badges unlocked
        List<String> newBadges = report.getBadgesUnlocked();
        if (newBadges != null && !newBadges.isEmpty()) {
            JPanel badgeCard = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 6));
            badgeCard.setBackground(UITheme.BG_CARD);
            badgeCard.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(UITheme.WARNING, 1, true), new EmptyBorder(10, 12, 10, 12)));
            badgeCard.setMaximumSize(new Dimension(Short.MAX_VALUE, 60));
            JLabel badgeTitle = new JLabel("New Badges Unlocked:  ");
            badgeTitle.setFont(UITheme.FONT_BOLD);
            badgeTitle.setForeground(UITheme.WARNING);
            badgeCard.add(badgeTitle);
            for (String b : newBadges) {
                JLabel bl = UITheme.createBadge(b, UITheme.WARNING_DARK, UITheme.WARNING);
                badgeCard.add(bl);
            }
            statsPanel.add(badgeCard);
            statsPanel.add(Box.createVerticalStrut(12));
        }

        // Recommendations
        List<String> recs = report.getRecommendations();
        if (recs != null && !recs.isEmpty()) {
            JPanel recCard = new JPanel(new BorderLayout(0, 8));
            recCard.setBackground(UITheme.BG_CARD);
            recCard.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(UITheme.BORDER_COLOR, 1, true), new EmptyBorder(14, 16, 14, 16)));
            recCard.setMaximumSize(new Dimension(Short.MAX_VALUE, 120));
            JLabel recTitle = new JLabel("Recommendations for Improvement");
            recTitle.setFont(UITheme.FONT_BOLD);
            recTitle.setForeground(UITheme.ACCENT_CYAN);
            recCard.add(recTitle, BorderLayout.NORTH);
            StringBuilder sb = new StringBuilder("<html><body style='width:350px;color:#CBD5E1;'><ul style='margin:0;padding-left:18px;'>");
            for (String r : recs) sb.append("<li>").append(r).append("</li>");
            sb.append("</ul></body></html>");
            JLabel recText = new JLabel(sb.toString());
            recText.setFont(UITheme.FONT_SMALL);
            recCard.add(recText, BorderLayout.CENTER);
            statsPanel.add(recCard);
        }

        statsPanel.add(Box.createVerticalGlue());
        content.add(statsPanel, BorderLayout.CENTER);
        add(content, BorderLayout.CENTER);

        // Bottom buttons
        JPanel bottomBar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 14, 14));
        bottomBar.setBackground(UITheme.BG_CARD);
        JButton reviewBtn = UITheme.createSecondaryButton("  Review Answers  ");
        JButton analyticsBtn = UITheme.createSecondaryButton("  View Analytics  ");
        JButton dashBtn = UITheme.createPrimaryButton("  Back to Dashboard  ");
        reviewBtn.addActionListener(e -> new ReviewAnswersScreen(report).setVisible(true));
        analyticsBtn.addActionListener(e -> new AnalyticsScreen(candidate, manager).setVisible(true));
        dashBtn.addActionListener(e -> { dashboard.setVisible(true); this.dispose(); });
        bottomBar.add(reviewBtn);
        bottomBar.add(analyticsBtn);
        bottomBar.add(dashBtn);
        add(bottomBar, BorderLayout.SOUTH);
    }

    private JPanel buildLegendRow(String label, int count, Color color) {
        JPanel row = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        row.setOpaque(false);
        JLabel dot = new JLabel("  ");
        dot.setOpaque(true);
        dot.setBackground(color);
        dot.setPreferredSize(new Dimension(16, 16));
        JLabel lbl = new JLabel(label + ": " + count);
        lbl.setFont(UITheme.FONT_SMALL);
        lbl.setForeground(UITheme.TEXT_SECONDARY);
        row.add(dot);
        row.add(lbl);
        return row;
    }

    private String getGrade(double pct) {
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B";
        if (pct >= 60) return "C";
        if (pct >= 50) return "D";
        return "F";
    }

    private Color getGradeColor(String grade) {
        return switch (grade) {
            case "A+", "A" -> UITheme.SUCCESS;
            case "B"       -> UITheme.PRIMARY;
            case "C"       -> UITheme.WARNING;
            case "D"       -> UITheme.ACCENT_PURPLE;
            default        -> UITheme.DANGER;
        };
    }

    /** Custom JPanel that draws a donut-style score ring */
    static class ScoreRingCanvas extends JPanel {
        private final int correct, wrong, skipped, total;
        ScoreRingCanvas(int correct, int wrong, int skipped, int total) {
            this.correct = correct; this.wrong = wrong; this.skipped = skipped; this.total = total;
            setOpaque(false);
        }
        @Override protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            int w = getWidth(), h = getHeight();
            int sz = Math.min(w, h) - 16;
            int x = (w - sz) / 2, y = (h - sz) / 2;
            int thickness = sz / 7;

            double startAngle = 90;
            double totalD = Math.max(total, 1);
            Color[] colors = {UITheme.SUCCESS, UITheme.DANGER, UITheme.TEXT_MUTED};
            int[] values = {correct, wrong, skipped};
            for (int i = 0; i < 3; i++) {
                double arc = (values[i] / totalD) * 360.0;
                if (arc > 0) {
                    g2.setColor(colors[i]);
                    g2.setStroke(new BasicStroke(thickness, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                    g2.draw(new Arc2D.Double(x + thickness/2, y + thickness/2, sz - thickness, sz - thickness, startAngle, -arc, Arc2D.OPEN));
                    startAngle -= arc;
                }
            }
            // Center text
            double pct = total == 0 ? 0 : (correct * 100.0 / total);
            String pctStr = String.format("%.0f%%", pct);
            g2.setFont(new Font("Segoe UI", Font.BOLD, sz / 4));
            g2.setColor(UITheme.TEXT_PRIMARY);
            FontMetrics fm = g2.getFontMetrics();
            g2.drawString(pctStr, w/2 - fm.stringWidth(pctStr)/2, h/2 + fm.getAscent()/3);
            g2.setFont(new Font("Segoe UI", Font.PLAIN, sz / 9));
            g2.setColor(UITheme.TEXT_MUTED);
            String acc = "Accuracy";
            g2.drawString(acc, w/2 - fm.stringWidth(acc)/2 + 4, h/2 + fm.getAscent()/3 + sz/8);
            g2.dispose();
        }
    }
}
