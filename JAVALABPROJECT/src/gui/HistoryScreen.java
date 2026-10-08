package gui;

import model.AssessmentSessionReport;
import model.Candidate;
import service.AssessmentManager;
import util.UITheme;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

/**
 * History Screen - Clean table view of all assessment attempts with score highlights.
 */
public class HistoryScreen extends JFrame {

    private Candidate candidate;
    private AssessmentManager manager;
    private JTable table;
    private DefaultTableModel model;
    private List<AssessmentSessionReport> reports;

    public HistoryScreen(Candidate candidate, AssessmentManager manager) {
        this.candidate = candidate;
        this.manager = manager;
        this.reports = candidate.getAssessmentHistory();

        setTitle("Assessment History - " + candidate.getName());
        setSize(1000, 600);
        setMinimumSize(new Dimension(800, 480));
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

        JLabel title = new JLabel("Assessment History & Transcripts");
        title.setFont(UITheme.FONT_HEADER_LARGE);
        title.setForeground(UITheme.TEXT_PRIMARY);

        JLabel sub = new JLabel("All test sessions for " + candidate.getName() +
            "  |  Total attempts: " + reports.size());
        sub.setFont(UITheme.FONT_SMALL);
        sub.setForeground(UITheme.TEXT_MUTED);

        JPanel hText = new JPanel(new GridLayout(2, 1, 0, 5));
        hText.setOpaque(false);
        hText.add(title);
        hText.add(sub);
        header.add(hText, BorderLayout.WEST);
        add(header, BorderLayout.NORTH);

        // Table
        String[] columns = {"#", "Date & Time", "Domain / Company", "Difficulty", "Questions", "Correct", "Wrong", "Net Score", "Percentage", "Percentile"};
        model = new DefaultTableModel(columns, 0) {
            @Override public boolean isCellEditable(int row, int col) { return false; }
        };

        table = new JTable(model);
        table.setFont(UITheme.FONT_MEDIUM);
        table.setRowHeight(34);
        table.setBackground(UITheme.BG_CARD);
        table.setForeground(UITheme.TEXT_PRIMARY);
        table.setGridColor(UITheme.BORDER_COLOR);
        table.setShowHorizontalLines(true);
        table.setShowVerticalLines(false);
        table.setSelectionBackground(UITheme.PRIMARY);
        table.setSelectionForeground(Color.WHITE);
        table.setIntercellSpacing(new Dimension(0, 1));

        // Header styling
        table.getTableHeader().setBackground(UITheme.BG_CARD_ALT);
        table.getTableHeader().setForeground(UITheme.TEXT_PRIMARY);
        table.getTableHeader().setFont(UITheme.FONT_BOLD);
        table.getTableHeader().setReorderingAllowed(false);
        table.getTableHeader().setBorder(new EmptyBorder(0, 8, 0, 8));

        // Column widths
        int[] widths = {40, 160, 160, 80, 80, 70, 70, 90, 90, 90};
        for (int i = 0; i < widths.length; i++) {
            table.getColumnModel().getColumn(i).setPreferredWidth(widths[i]);
        }

        // Populate
        int rowNum = 1;
        for (AssessmentSessionReport r : reports) {
            model.addRow(new Object[]{
                rowNum++,
                r.getTimestamp(),
                r.getDomain(),
                r.getDifficultyMode(),
                r.getTotalQuestions(),
                r.getCorrectCount(),
                r.getWrongCount(),
                String.format("%.2f", r.getNetScore()),
                String.format("%.1f%%", r.getPercentageScore()),
                String.format("%.1f%%", r.getPlacementPercentile())
            });
        }

        // Alternating row colors + percentage coloring
        table.setDefaultRenderer(Object.class, new DefaultTableCellRenderer() {
            @Override public Component getTableCellRendererComponent(JTable t, Object value, boolean selected, boolean focus, int row, int col) {
                Component c = super.getTableCellRendererComponent(t, value, selected, focus, row, col);
                if (!selected) {
                    c.setBackground(row % 2 == 0 ? UITheme.BG_CARD : new Color(24, 35, 52));
                    c.setForeground(UITheme.TEXT_SECONDARY);
                    // Color percentage column
                    if (col == 8 && value != null) {
                        String s = value.toString().replace("%","");
                        try {
                            double p = Double.parseDouble(s);
                            if (p >= 70) c.setForeground(UITheme.SUCCESS);
                            else if (p >= 50) c.setForeground(UITheme.WARNING);
                            else c.setForeground(UITheme.DANGER);
                        } catch (NumberFormatException ignored) {}
                    }
                    if (col == 7 && value != null) {
                        try {
                            double ns = Double.parseDouble(value.toString());
                            c.setForeground(ns >= 0 ? UITheme.SUCCESS : UITheme.DANGER);
                        } catch (NumberFormatException ignored) {}
                    }
                }
                setBorder(new EmptyBorder(0, 8, 0, 8));
                return c;
            }
        });

        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(null);
        scroll.setBackground(UITheme.BG_DARK);
        scroll.getViewport().setBackground(UITheme.BG_DARK);
        add(scroll, BorderLayout.CENTER);

        // Bottom
        JPanel bottom = new JPanel(new FlowLayout(FlowLayout.RIGHT, 14, 12));
        bottom.setBackground(UITheme.BG_CARD);
        JButton reviewSelected = UITheme.createSecondaryButton("  Review Selected  ");
        reviewSelected.addActionListener(e -> {
            int selectedRow = table.getSelectedRow();
            if (selectedRow >= 0 && selectedRow < reports.size()) {
                new ReviewAnswersScreen(reports.get(selectedRow)).setVisible(true);
            } else {
                JOptionPane.showMessageDialog(this, "Please select a row to review.", "No Selection", JOptionPane.INFORMATION_MESSAGE);
            }
        });
        JButton closeBtn = UITheme.createPrimaryButton("  Close  ");
        closeBtn.addActionListener(e -> dispose());
        bottom.add(reviewSelected);
        bottom.add(closeBtn);
        add(bottom, BorderLayout.SOUTH);
    }
}
