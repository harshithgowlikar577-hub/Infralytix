package util;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.geom.RoundRectangle2D;

/**
 * Premium Dark Enterprise UI Theme for the AI Placement Assessment Platform.
 * High-contrast, accessible, professional design system.
 */
public class UITheme {

    // === BACKGROUND PALETTE ===
    public static final Color BG_DARK       = new Color(15, 23, 42);        // #0F172A
    public static final Color BG_CARD       = new Color(30, 41, 59);        // #1E293B
    public static final Color BG_CARD_ALT   = new Color(51, 65, 85);        // #334155
    public static final Color BG_INPUT      = new Color(15, 23, 42);
    public static final Color BG_HEADER     = new Color(17, 24, 39);        // #111827

    // === ACCENT / PRIMARY COLORS ===
    public static final Color PRIMARY       = new Color(59, 130, 246);      // #3B82F6
    public static final Color PRIMARY_HOVER = new Color(37, 99, 235);       // #2563EB
    public static final Color PRIMARY_LIGHT = new Color(96, 165, 250);      // #60A5FA
    public static final Color ACCENT_PURPLE = new Color(168, 85, 247);      // #A855F7
    public static final Color ACCENT_CYAN   = new Color(6, 182, 212);       // #06B6D4
    public static final Color ACCENT_INDIGO = new Color(99, 102, 241);      // #6366F1

    // === SEMANTIC COLORS ===
    public static final Color SUCCESS       = new Color(34, 197, 94);       // #22C55E
    public static final Color SUCCESS_DARK  = new Color(21, 128, 61);
    public static final Color WARNING       = new Color(245, 158, 11);      // #F59E0B
    public static final Color WARNING_DARK  = new Color(120, 53, 15);
    public static final Color DANGER        = new Color(239, 68, 68);       // #EF4444
    public static final Color DANGER_DARK   = new Color(127, 29, 29);

    // Backward-compatibility aliases
    public static final Color PRIMARY_INDIGO  = ACCENT_INDIGO;
    public static final Color SUCCESS_EMERALD = SUCCESS;
    public static final Color ERROR_ROSE      = DANGER;
    public static final Color WARNING_AMBER   = WARNING;

    // === TEXT COLORS ===
    public static final Color TEXT_PRIMARY  = new Color(255, 255, 255);     // #FFFFFF
    public static final Color TEXT_LIGHT    = new Color(241, 245, 249);     // #F1F5F9
    public static final Color TEXT_SECONDARY= new Color(203, 213, 225);     // #CBD5E1
    public static final Color TEXT_MUTED    = new Color(148, 163, 184);     // #94A3B8
    public static final Color TEXT_DISABLED = new Color(100, 116, 139);

    // === BORDER ===
    public static final Color BORDER_COLOR  = new Color(51, 65, 85);
    public static final Color BORDER_FOCUS  = new Color(59, 130, 246);

    // === FONTS ===
    public static final Font FONT_DISPLAY      = new Font("Segoe UI", Font.BOLD, 32);
    public static final Font FONT_HEADER_LARGE = new Font("Segoe UI", Font.BOLD, 26);
    public static final Font FONT_TITLE        = new Font("Segoe UI", Font.BOLD, 20);
    public static final Font FONT_SUBTITLE     = new Font("Segoe UI", Font.BOLD, 16);
    public static final Font FONT_REGULAR      = new Font("Segoe UI", Font.PLAIN, 15);
    public static final Font FONT_MEDIUM       = new Font("Segoe UI", Font.PLAIN, 14);
    public static final Font FONT_BOLD         = new Font("Segoe UI", Font.BOLD, 14);
    public static final Font FONT_SMALL        = new Font("Segoe UI", Font.PLAIN, 13);
    public static final Font FONT_TINY         = new Font("Segoe UI", Font.PLAIN, 12);
    public static final Font FONT_CODE         = new Font("Consolas", Font.PLAIN, 14);
    public static final Font FONT_OPTION       = new Font("Segoe UI", Font.PLAIN, 15);

    // ================================================================
    // BUTTON FACTORY METHODS
    // ================================================================

    public static JButton createPrimaryButton(String text) {
        JButton btn = new JButton(text) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(getBackground());
                g2.fill(new RoundRectangle2D.Float(0, 0, getWidth(), getHeight(), 10, 10));
                g2.dispose();
                super.paintComponent(g);
            }
        };
        styleBtn(btn, PRIMARY, Color.WHITE, FONT_BOLD);
        btn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { btn.setBackground(PRIMARY_HOVER); }
            public void mouseExited(MouseEvent e)  { btn.setBackground(PRIMARY); }
            public void mousePressed(MouseEvent e) { btn.setBackground(new Color(29, 78, 216)); }
            public void mouseReleased(MouseEvent e){ btn.setBackground(PRIMARY_HOVER); }
        });
        return btn;
    }

    public static JButton createSecondaryButton(String text) {
        JButton btn = new JButton(text) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(getBackground());
                g2.fill(new RoundRectangle2D.Float(0, 0, getWidth(), getHeight(), 10, 10));
                g2.setColor(BORDER_COLOR);
                g2.draw(new RoundRectangle2D.Float(0, 0, getWidth()-1, getHeight()-1, 10, 10));
                g2.dispose();
                super.paintComponent(g);
            }
        };
        styleBtn(btn, BG_CARD_ALT, TEXT_SECONDARY, FONT_BOLD);
        btn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { btn.setBackground(new Color(71, 85, 105)); btn.setForeground(TEXT_PRIMARY); }
            public void mouseExited(MouseEvent e)  { btn.setBackground(BG_CARD_ALT); btn.setForeground(TEXT_SECONDARY); }
        });
        return btn;
    }

    public static JButton createSuccessButton(String text) {
        JButton btn = new JButton(text) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(getBackground());
                g2.fill(new RoundRectangle2D.Float(0, 0, getWidth(), getHeight(), 10, 10));
                g2.dispose();
                super.paintComponent(g);
            }
        };
        styleBtn(btn, SUCCESS, Color.WHITE, FONT_BOLD);
        btn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { btn.setBackground(new Color(22, 163, 74)); }
            public void mouseExited(MouseEvent e)  { btn.setBackground(SUCCESS); }
        });
        return btn;
    }

    public static JButton createDangerButton(String text) {
        JButton btn = new JButton(text) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(getBackground());
                g2.fill(new RoundRectangle2D.Float(0, 0, getWidth(), getHeight(), 10, 10));
                g2.dispose();
                super.paintComponent(g);
            }
        };
        styleBtn(btn, DANGER, Color.WHITE, FONT_BOLD);
        btn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { btn.setBackground(new Color(220, 38, 38)); }
            public void mouseExited(MouseEvent e)  { btn.setBackground(DANGER); }
        });
        return btn;
    }

    private static void styleBtn(JButton btn, Color bg, Color fg, Font font) {
        btn.setFont(font);
        btn.setForeground(fg);
        btn.setBackground(bg);
        btn.setFocusPainted(false);
        btn.setContentAreaFilled(false);
        btn.setOpaque(false);
        btn.setBorderPainted(false);
        btn.setBorder(new EmptyBorder(12, 24, 12, 24));
        btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
    }

    // ================================================================
    // PANEL / CARD FACTORY
    // ================================================================

    public static JPanel createCardPanel() {
        JPanel panel = new JPanel();
        panel.setBackground(BG_CARD);
        panel.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(BORDER_COLOR, 1, true),
            new EmptyBorder(16, 18, 16, 18)
        ));
        return panel;
    }

    /** Stat card with accent color bar at top */
    public static JPanel createStatCard(String label, String value, Color accentColor) {
        JPanel card = new JPanel(new BorderLayout(0, 8));
        card.setBackground(BG_CARD);
        card.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(BORDER_COLOR, 1, true),
            new EmptyBorder(16, 18, 16, 18)
        ));

        JPanel accentBar = new JPanel();
        accentBar.setBackground(accentColor);
        accentBar.setPreferredSize(new Dimension(0, 4));
        card.add(accentBar, BorderLayout.NORTH);

        JPanel content = new JPanel(new GridLayout(2, 1, 0, 5));
        content.setOpaque(false);

        JLabel valueLbl = new JLabel(value, SwingConstants.LEFT);
        valueLbl.setFont(new Font("Segoe UI", Font.BOLD, 26));
        valueLbl.setForeground(TEXT_PRIMARY);

        JLabel labelLbl = new JLabel(label, SwingConstants.LEFT);
        labelLbl.setFont(FONT_SMALL);
        labelLbl.setForeground(TEXT_MUTED);

        content.add(valueLbl);
        content.add(labelLbl);
        card.add(content, BorderLayout.CENTER);
        return card;
    }

    // ================================================================
    // FIELD FACTORIES
    // ================================================================

    public static JTextField createTextField(int columns) {
        JTextField tf = new JTextField(columns);
        tf.setFont(FONT_REGULAR);
        tf.setForeground(TEXT_PRIMARY);
        tf.setBackground(BG_INPUT);
        tf.setCaretColor(PRIMARY_LIGHT);
        tf.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(BORDER_COLOR, 1),
            new EmptyBorder(10, 12, 10, 12)
        ));
        return tf;
    }

    public static JPasswordField createPasswordField(int columns) {
        JPasswordField pf = new JPasswordField(columns);
        pf.setFont(FONT_REGULAR);
        pf.setForeground(TEXT_PRIMARY);
        pf.setBackground(BG_INPUT);
        pf.setCaretColor(PRIMARY_LIGHT);
        pf.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(BORDER_COLOR, 1),
            new EmptyBorder(10, 12, 10, 12)
        ));
        return pf;
    }

    // ================================================================
    // LABEL / BADGE FACTORY
    // ================================================================

    public static JLabel createBadge(String text, Color bg, Color fg) {
        JLabel lbl = new JLabel(" " + text + " ");
        lbl.setFont(FONT_BOLD);
        lbl.setOpaque(true);
        lbl.setBackground(bg);
        lbl.setForeground(fg);
        lbl.setBorder(new EmptyBorder(4, 10, 4, 10));
        return lbl;
    }

    // ================================================================
    // PROGRESS BAR
    // ================================================================

    public static JProgressBar createProgressBar(int min, int max, Color foreground) {
        JProgressBar pb = new JProgressBar(min, max) {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(BG_CARD_ALT);
                g2.fill(new RoundRectangle2D.Float(0, 0, getWidth(), getHeight(), getHeight(), getHeight()));
                double pct = (getMaximum() - getMinimum()) == 0 ? 0 :
                    (double)(getValue() - getMinimum()) / (getMaximum() - getMinimum());
                int fw = (int)(getWidth() * pct);
                if (fw > 0) {
                    g2.setColor(getForeground());
                    g2.fill(new RoundRectangle2D.Float(0, 0, fw, getHeight(), getHeight(), getHeight()));
                }
                g2.dispose();
            }
        };
        pb.setBorderPainted(false);
        pb.setStringPainted(false);
        pb.setForeground(foreground);
        pb.setBackground(BG_CARD_ALT);
        pb.setOpaque(false);
        pb.setPreferredSize(new Dimension(0, 10));
        return pb;
    }

    // ================================================================
    // GLOBAL LAF SETUP
    // ================================================================

    public static void applyGlobalLaf() {
        try { UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName()); }
        catch (Exception ignored) {}
        UIManager.put("OptionPane.background", BG_CARD);
        UIManager.put("Panel.background", BG_CARD);
        UIManager.put("OptionPane.messageForeground", TEXT_PRIMARY);
        UIManager.put("Button.background", BG_CARD_ALT);
        UIManager.put("Button.foreground", TEXT_PRIMARY);
        UIManager.put("TextField.background", BG_INPUT);
        UIManager.put("TextField.foreground", TEXT_PRIMARY);
        UIManager.put("PasswordField.background", BG_INPUT);
        UIManager.put("PasswordField.foreground", TEXT_PRIMARY);
        UIManager.put("Label.foreground", TEXT_PRIMARY);
        UIManager.put("ComboBox.background", BG_CARD_ALT);
        UIManager.put("ComboBox.foreground", TEXT_PRIMARY);
        UIManager.put("Table.background", BG_CARD);
        UIManager.put("Table.foreground", TEXT_PRIMARY);
        UIManager.put("Table.gridColor", BORDER_COLOR);
        UIManager.put("Table.selectionBackground", PRIMARY);
        UIManager.put("Table.selectionForeground", Color.WHITE);
        UIManager.put("TableHeader.background", BG_CARD_ALT);
        UIManager.put("TableHeader.foreground", TEXT_PRIMARY);
        UIManager.put("ScrollPane.background", BG_DARK);
        UIManager.put("ScrollBar.thumb", BG_CARD_ALT);
        UIManager.put("ScrollBar.track", BG_DARK);
    }
}
