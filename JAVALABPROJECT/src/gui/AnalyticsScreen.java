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
import java.awt.geom.RoundRectangle2D;
import java.util.*;
import java.util.List;

/**
 * Analytics Screen - Visual performance dashboards with Swing 2D custom charts.
 */
public class AnalyticsScreen extends JFrame {

    private Candidate candidate;
    private AssessmentManager manager;
    private List<AssessmentSessionReport> history;

    public AnalyticsScreen(Candidate candidate, AssessmentManager manager) {
        this.candidate = candidate;
        this.manager = manager;
        this.history = candidate.getAssessmentHistory();

        setTitle("Performance Analytics - " + candidate.getName());
        setSize(1080, 740);
        setMinimumSize(new Dimension(900, 600));
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
        header.setBorder(new EmptyBorder(16, 24, 16, 24));
        JLabel title = new JLabel("Performance Analytics & Trends");
        title.setFont(UITheme.FONT_HEADER_LARGE);
        title.setForeground(UITheme.TEXT_PRIMARY);
        JLabel sub = new JLabel("Visual analytics for " + candidate.getName() +
            "  |  " + history.size() + " total assessments");
        sub.setFont(UITheme.FONT_SMALL);
        sub.setForeground(UITheme.ACCENT_CYAN);
        JPanel hText = new JPanel(new GridLayout(2, 1, 0, 5));
        hText.setOpaque(false);
        hText.add(title);
        hText.add(sub);
        header.add(hText, BorderLayout.WEST);
        JButton closeBtn = UITheme.createSecondaryButton("  Close  ");
        closeBtn.addActionListener(e -> dispose());
        header.add(closeBtn, BorderLayout.EAST);
        add(header, BorderLayout.NORTH);

        // Scrollable content
        JPanel content = new JPanel();
        content.setLayout(new BoxLayout(content, BoxLayout.Y_AXIS));
        content.setBackground(UITheme.BG_DARK);
        content.setBorder(new EmptyBorder(20, 26, 20, 26));

        // Stat row
        JPanel statRow = new JPanel(new GridLayout(1, 4, 14, 14));
        statRow.setOpaque(false);
        statRow.setMaximumSize(new Dimension(Short.MAX_VALUE, 100));
        statRow.add(UITheme.createStatCard("Total Tests", String.valueOf(history.size()), UITheme.PRIMARY));
        statRow.add(UITheme.createStatCard("Average Score", String.format("%.1f%%", candidate.getAverageScore()), UITheme.ACCENT_CYAN));
        statRow.add(UITheme.createStatCard("Best Score", candidate.getBestScore() + "%", UITheme.SUCCESS));
        statRow.add(UITheme.createStatCard("Strongest Domain", computeBestDomain(), UITheme.ACCENT_PURPLE));
        content.add(statRow);
        content.add(Box.createVerticalStrut(20));

        // Charts row
        JPanel chartsRow = new JPanel(new GridLayout(1, 2, 16, 16));
        chartsRow.setOpaque(false);
        chartsRow.setMaximumSize(new Dimension(Short.MAX_VALUE, 310));

        chartsRow.add(buildAccuracyDonutCard());
        chartsRow.add(buildDomainBarCard());
        content.add(chartsRow);
        content.add(Box.createVerticalStrut(20));

        // Score trend
        JPanel trendCard = buildScoreTrendCard();
        trendCard.setMaximumSize(new Dimension(Short.MAX_VALUE, 220));
        content.add(trendCard);
        content.add(Box.createVerticalStrut(20));

        // Weak areas + strong areas
        JPanel strengthRow = new JPanel(new GridLayout(1, 2, 16, 16));
        strengthRow.setOpaque(false);
        strengthRow.setMaximumSize(new Dimension(Short.MAX_VALUE, 180));
        strengthRow.add(buildWeakAreasCard());
        strengthRow.add(buildStrongAreasCard());
        content.add(strengthRow);

        JScrollPane scroll = new JScrollPane(content);
        scroll.setBorder(null);
        scroll.setBackground(UITheme.BG_DARK);
        scroll.getViewport().setBackground(UITheme.BG_DARK);
        add(scroll, BorderLayout.CENTER);
    }

    // ---- DONUT CHART ----
    private JPanel buildAccuracyDonutCard() {
        JPanel card = new JPanel(new BorderLayout(0, 12));
        card.setBackground(UITheme.BG_CARD);
        card.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.BORDER_COLOR, 1, true), new EmptyBorder(16, 18, 16, 18)));

        JLabel title = new JLabel("Overall Answer Distribution");
        title.setFont(UITheme.FONT_SUBTITLE);
        title.setForeground(UITheme.TEXT_PRIMARY);
        card.add(title, BorderLayout.NORTH);

        int totalC = 0, totalW = 0, totalS = 0;
        for (AssessmentSessionReport r : history) {
            totalC += r.getCorrectCount();
            totalW += r.getWrongCount();
            totalS += r.getSkippedCount();
        }
        final int fC = totalC, fW = totalW, fS = totalS;

        JPanel donutPanel = new JPanel() {
            @Override protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                int w = getWidth(), h = getHeight();
                int sz = Math.min(w, h) - 20;
                int x = (w-sz)/2, y = (h-sz)/2;
                int thick = sz / 6;
                double total = fC + fW + fS;
                if (total == 0) total = 1;
                double[] vals = {fC, fW, fS};
                Color[] cols = {UITheme.SUCCESS, UITheme.DANGER, UITheme.TEXT_MUTED};
                double start = 90;
                g2.setStroke(new BasicStroke(thick, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                for (int i = 0; i < 3; i++) {
                    double arc = (vals[i] / total) * 360.0;
                    if (arc > 0) {
                        g2.setColor(cols[i]);
                        g2.draw(new Arc2D.Double(x + thick/2, y + thick/2, sz-thick, sz-thick, start, -arc, Arc2D.OPEN));
                        start -= arc;
                    }
                }
                double acc = fC * 100.0 / total;
                g2.setFont(new Font("Segoe UI", Font.BOLD, sz/5));
                g2.setColor(UITheme.TEXT_PRIMARY);
                String s = String.format("%.0f%%", acc);
                FontMetrics fm = g2.getFontMetrics();
                g2.drawString(s, w/2 - fm.stringWidth(s)/2, h/2 + fm.getAscent()/3);
                g2.dispose();
            }
        };
        donutPanel.setOpaque(false);
        card.add(donutPanel, BorderLayout.CENTER);

        JPanel legend = new JPanel(new GridLayout(3, 1, 0, 6));
        legend.setOpaque(false);
        legend.add(buildLegend("Correct",   fC, UITheme.SUCCESS));
        legend.add(buildLegend("Incorrect", fW, UITheme.DANGER));
        legend.add(buildLegend("Skipped",   fS, UITheme.TEXT_MUTED));
        card.add(legend, BorderLayout.SOUTH);
        return card;
    }

    // ---- DOMAIN BAR CHART ----
    private JPanel buildDomainBarCard() {
        JPanel card = new JPanel(new BorderLayout(0, 12));
        card.setBackground(UITheme.BG_CARD);
        card.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.BORDER_COLOR, 1, true), new EmptyBorder(16, 18, 16, 18)));

        JLabel title = new JLabel("Domain Performance Comparison");
        title.setFont(UITheme.FONT_SUBTITLE);
        title.setForeground(UITheme.TEXT_PRIMARY);
        card.add(title, BorderLayout.NORTH);

        Map<String, double[]> domainData = new LinkedHashMap<>();
        for (AssessmentSessionReport r : history) {
            String dom = r.getDomain().toUpperCase();
            if (dom.contains("APTITUDE")) dom = "Aptitude";
            else if (dom.contains("LOGIC") || dom.contains("REASONING")) dom = "Reasoning";
            else if (dom.contains("JAVA")) dom = "Java";
            else if (dom.contains("DBMS") || dom.contains("DATABASE")) dom = "DBMS";
            else if (dom.contains("CS") || dom.contains("COMPUTER")) dom = "CS Fund.";
            else dom = "Other";
            domainData.computeIfAbsent(dom, k -> new double[]{0, 0});
            domainData.get(dom)[0] += r.getPercentageScore();
            domainData.get(dom)[1]++;
        }

        String[] labels = domainData.keySet().toArray(new String[0]);
        double[] avgs = domainData.values().stream()
            .mapToDouble(v -> v[1] == 0 ? 0 : v[0] / v[1]).toArray();
        Color[] barColors = {UITheme.PRIMARY, UITheme.ACCENT_PURPLE, UITheme.SUCCESS, UITheme.WARNING, UITheme.ACCENT_CYAN};

        JPanel barPanel = new JPanel() {
            @Override protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                if (labels.length == 0) return;
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                int w = getWidth(), h = getHeight();
                int padL = 40, padB = 36, padT = 10, padR = 10;
                int chartW = w - padL - padR;
                int chartH = h - padT - padB;
                // Y axis
                g2.setColor(UITheme.BORDER_COLOR);
                g2.drawLine(padL, padT, padL, padT + chartH);
                g2.drawLine(padL, padT + chartH, padL + chartW, padT + chartH);
                // Y gridlines + labels
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 10));
                g2.setColor(UITheme.TEXT_MUTED);
                for (int pct = 0; pct <= 100; pct += 25) {
                    int y2 = padT + chartH - (int)(chartH * pct / 100.0);
                    g2.setColor(UITheme.BORDER_COLOR);
                    g2.drawLine(padL, y2, padL + chartW, y2);
                    g2.setColor(UITheme.TEXT_MUTED);
                    g2.drawString(pct + "%", 2, y2 + 4);
                }
                if (labels.length == 0) { g2.dispose(); return; }
                int barW = Math.min(60, (chartW / labels.length) - 16);
                int gap  = (chartW - barW * labels.length) / (labels.length + 1);
                for (int i = 0; i < labels.length; i++) {
                    int bx = padL + gap * (i+1) + barW * i;
                    int bh = (int)(chartH * avgs[i] / 100.0);
                    int by = padT + chartH - bh;
                    Color bc = barColors[i % barColors.length];
                    g2.setColor(bc);
                    g2.fill(new RoundRectangle2D.Float(bx, by, barW, bh, 6, 6));
                    // Value label above
                    g2.setColor(UITheme.TEXT_PRIMARY);
                    g2.setFont(new Font("Segoe UI", Font.BOLD, 10));
                    String val = String.format("%.0f%%", avgs[i]);
                    FontMetrics fm = g2.getFontMetrics();
                    g2.drawString(val, bx + barW/2 - fm.stringWidth(val)/2, by - 3);
                    // Domain label below
                    g2.setColor(UITheme.TEXT_MUTED);
                    g2.setFont(new Font("Segoe UI", Font.PLAIN, 10));
                    String dl = labels[i].length() > 8 ? labels[i].substring(0, 8) : labels[i];
                    g2.drawString(dl, bx + barW/2 - g2.getFontMetrics().stringWidth(dl)/2, padT + chartH + 16);
                }
                g2.dispose();
            }
        };
        barPanel.setOpaque(false);
        card.add(barPanel, BorderLayout.CENTER);
        return card;
    }

    // ---- SCORE TREND ----
    private JPanel buildScoreTrendCard() {
        JPanel card = new JPanel(new BorderLayout(0, 10));
        card.setBackground(UITheme.BG_CARD);
        card.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.BORDER_COLOR, 1, true), new EmptyBorder(16, 18, 16, 18)));

        JLabel title = new JLabel("Score Trend (Last 10 Assessments)");
        title.setFont(UITheme.FONT_SUBTITLE);
        title.setForeground(UITheme.TEXT_PRIMARY);
        card.add(title, BorderLayout.NORTH);

        List<Double> scores = new ArrayList<>();
        int from = Math.max(0, history.size() - 10);
        for (int i = from; i < history.size(); i++) scores.add(history.get(i).getPercentageScore());

        JPanel linePanel = new JPanel() {
            @Override protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                if (scores.size() < 2) {
                    Graphics2D g2 = (Graphics2D) g.create();
                    g2.setColor(UITheme.TEXT_MUTED);
                    g2.setFont(UITheme.FONT_REGULAR);
                    g2.drawString("Complete at least 2 assessments to see trend.", 20, getHeight()/2);
                    g2.dispose();
                    return;
                }
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                int w = getWidth(), h = getHeight();
                int padL = 40, padB = 28, padT = 12, padR = 12;
                int cW = w - padL - padR, cH = h - padT - padB;
                // Axes
                g2.setColor(UITheme.BORDER_COLOR);
                g2.drawLine(padL, padT, padL, padT + cH);
                g2.drawLine(padL, padT + cH, padL + cW, padT + cH);
                // Y gridlines
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 10));
                for (int pct = 0; pct <= 100; pct += 25) {
                    int yy = padT + cH - (int)(cH * pct / 100.0);
                    g2.setColor(UITheme.BORDER_COLOR);
                    g2.drawLine(padL, yy, padL + cW, yy);
                    g2.setColor(UITheme.TEXT_MUTED);
                    g2.drawString(pct + "%", 2, yy + 4);
                }
                // Line and dots
                double step = (double) cW / (scores.size() - 1);
                int[] xs = new int[scores.size()], ys = new int[scores.size()];
                for (int i = 0; i < scores.size(); i++) {
                    xs[i] = padL + (int)(step * i);
                    ys[i] = padT + cH - (int)(cH * scores.get(i) / 100.0);
                }
                // Gradient fill
                GradientPaint gp = new GradientPaint(0, padT, new Color(59, 130, 246, 80), 0, padT + cH, new Color(59, 130, 246, 0));
                g2.setPaint(gp);
                Polygon poly = new Polygon();
                poly.addPoint(xs[0], padT + cH);
                for (int i = 0; i < xs.length; i++) poly.addPoint(xs[i], ys[i]);
                poly.addPoint(xs[xs.length-1], padT + cH);
                g2.fillPolygon(poly);
                // Line
                g2.setColor(UITheme.PRIMARY);
                g2.setStroke(new BasicStroke(2.5f));
                for (int i = 0; i < xs.length - 1; i++) g2.drawLine(xs[i], ys[i], xs[i+1], ys[i+1]);
                // Dots
                g2.setStroke(new BasicStroke(1.5f));
                for (int i = 0; i < xs.length; i++) {
                    g2.setColor(UITheme.PRIMARY_LIGHT);
                    g2.fillOval(xs[i]-5, ys[i]-5, 10, 10);
                    g2.setColor(UITheme.BG_CARD);
                    g2.fillOval(xs[i]-3, ys[i]-3, 6, 6);
                    // Label
                    g2.setColor(UITheme.TEXT_MUTED);
                    g2.setFont(new Font("Segoe UI", Font.PLAIN, 9));
                    g2.drawString(String.format("%.0f", scores.get(i)), xs[i]-6, padT + cH + 14);
                }
                g2.dispose();
            }
        };
        linePanel.setOpaque(false);
        card.add(linePanel, BorderLayout.CENTER);
        return card;
    }

    // ---- WEAK AREAS ----
    private JPanel buildWeakAreasCard() {
        JPanel card = new JPanel(new BorderLayout(0, 10));
        card.setBackground(UITheme.BG_CARD);
        card.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.DANGER, 1, true), new EmptyBorder(14, 16, 14, 16)));

        JLabel title = new JLabel("Weak Areas - Focus Needed");
        title.setFont(UITheme.FONT_SUBTITLE);
        title.setForeground(UITheme.DANGER);
        card.add(title, BorderLayout.NORTH);

        JPanel list = new JPanel(new GridLayout(0, 1, 0, 6));
        list.setOpaque(false);

        Map<String, int[]> topicStats = getTopicStats();
        topicStats.entrySet().stream()
            .filter(e -> e.getValue()[1] > 0)
            .sorted(Comparator.comparingDouble(e -> (double)e.getValue()[0] / e.getValue()[1]))
            .limit(5)
            .forEach(e -> {
                double pct = (double)e.getValue()[0] / e.getValue()[1] * 100;
                list.add(buildProgressRow(e.getKey(), pct, UITheme.DANGER));
            });

        if (list.getComponentCount() == 0) {
            JLabel empty = new JLabel("No weak areas detected yet. Keep testing!");
            empty.setFont(UITheme.FONT_SMALL);
            empty.setForeground(UITheme.TEXT_MUTED);
            list.add(empty);
        }
        card.add(list, BorderLayout.CENTER);
        return card;
    }

    // ---- STRONG AREAS ----
    private JPanel buildStrongAreasCard() {
        JPanel card = new JPanel(new BorderLayout(0, 10));
        card.setBackground(UITheme.BG_CARD);
        card.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.SUCCESS, 1, true), new EmptyBorder(14, 16, 14, 16)));

        JLabel title = new JLabel("Strong Areas - Keep it Up!");
        title.setFont(UITheme.FONT_SUBTITLE);
        title.setForeground(UITheme.SUCCESS);
        card.add(title, BorderLayout.NORTH);

        JPanel list = new JPanel(new GridLayout(0, 1, 0, 6));
        list.setOpaque(false);

        Map<String, int[]> topicStats = getTopicStats();
        topicStats.entrySet().stream()
            .filter(e -> e.getValue()[1] > 0)
            .sorted((a, b) -> Double.compare(
                (double)b.getValue()[0] / b.getValue()[1],
                (double)a.getValue()[0] / a.getValue()[1]
            ))
            .limit(5)
            .forEach(e -> {
                double pct = (double)e.getValue()[0] / e.getValue()[1] * 100;
                list.add(buildProgressRow(e.getKey(), pct, UITheme.SUCCESS));
            });

        if (list.getComponentCount() == 0) {
            JLabel empty = new JLabel("Complete more assessments to identify strengths.");
            empty.setFont(UITheme.FONT_SMALL);
            empty.setForeground(UITheme.TEXT_MUTED);
            list.add(empty);
        }
        card.add(list, BorderLayout.CENTER);
        return card;
    }

    // ---- HELPERS ----
    private JPanel buildProgressRow(String label, double pct, Color color) {
        JPanel row = new JPanel(new BorderLayout(8, 0));
        row.setOpaque(false);
        JLabel lbl = new JLabel(label.length() > 22 ? label.substring(0, 22) + "..." : label);
        lbl.setFont(UITheme.FONT_TINY);
        lbl.setForeground(UITheme.TEXT_SECONDARY);
        lbl.setPreferredSize(new Dimension(140, 18));
        JProgressBar pb = UITheme.createProgressBar(0, 100, color);
        pb.setValue((int)pct);
        JLabel pLbl = new JLabel(String.format("%.0f%%", pct));
        pLbl.setFont(UITheme.FONT_TINY);
        pLbl.setForeground(color);
        pLbl.setPreferredSize(new Dimension(36, 18));
        row.add(lbl, BorderLayout.WEST);
        row.add(pb, BorderLayout.CENTER);
        row.add(pLbl, BorderLayout.EAST);
        return row;
    }

    private JPanel buildLegend(String label, int count, Color color) {
        JPanel row = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 0));
        row.setOpaque(false);
        JLabel dot = new JLabel("  ");
        dot.setOpaque(true);
        dot.setBackground(color);
        dot.setPreferredSize(new Dimension(14, 14));
        JLabel lbl = new JLabel(label + ": " + count);
        lbl.setFont(UITheme.FONT_SMALL);
        lbl.setForeground(UITheme.TEXT_SECONDARY);
        row.add(dot); row.add(lbl);
        return row;
    }

    private Map<String, int[]> getTopicStats() {
        Map<String, int[]> map = new LinkedHashMap<>();
        for (AssessmentSessionReport r : history) {
            for (model.MCQEvaluation e : r.getEvaluations()) {
                String topic = e.getTopic();
                map.computeIfAbsent(topic, k -> new int[]{0, 0});
                map.get(topic)[1]++;
                if ("CORRECT".equals(e.getStatus())) map.get(topic)[0]++;
            }
        }
        return map;
    }

    private String computeBestDomain() {
        Map<String, double[]> dm = new HashMap<>();
        for (AssessmentSessionReport r : history) {
            String d = r.getDomain().toUpperCase();
            dm.computeIfAbsent(d, k -> new double[]{0, 0});
            dm.get(d)[0] += r.getPercentageScore(); dm.get(d)[1]++;
        }
        return dm.entrySet().stream()
            .max(Comparator.comparingDouble(e -> e.getValue()[1] == 0 ? 0 : e.getValue()[0] / e.getValue()[1]))
            .map(Map.Entry::getKey).orElse("N/A");
    }
}
