package gui;

import model.Assessment;
import model.AptitudeAssessment;
import model.Candidate;
import model.CompanyMockAssessment;
import model.CSFundamentalsAssessment;
import model.DBMSAssessment;
import model.JavaAssessment;
import model.LogicalReasoningAssessment;
import service.AssessmentManager;
import util.UITheme;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.util.List;

/**
 * Main Dashboard - Modern placement assessment hub with profile, stats, and quick-launch tiles.
 */
public class MainDashboard extends JFrame {

    private Candidate candidate;
    private AssessmentManager manager;
    private JLabel xpLbl, levelLbl, streakLbl, testCountLbl, avgScoreLbl, bestScoreLbl;

    public MainDashboard(Candidate candidate, AssessmentManager manager) {
        this.candidate = candidate;
        this.manager = manager;
        setTitle("AI Placement Assessment Platform - Dashboard");
        setSize(1080, 720);
        setMinimumSize(new Dimension(900, 600));
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        getContentPane().setBackground(UITheme.BG_DARK);
        setLayout(new BorderLayout());
        initUI();
    }

    private void initUI() {
        add(buildTopBar(), BorderLayout.NORTH);
        add(buildSideBar(), BorderLayout.WEST);
        add(buildMainContent(), BorderLayout.CENTER);
    }

    // ---- TOP BAR ----
    private JPanel buildTopBar() {
        JPanel bar = new JPanel(new BorderLayout());
        bar.setBackground(UITheme.BG_HEADER);
        bar.setBorder(new EmptyBorder(14, 24, 14, 24));

        JLabel brandLbl = new JLabel("  AI Interview Simulator  |  Placement Assessment Platform");
        brandLbl.setFont(new Font("Segoe UI", Font.BOLD, 15));
        brandLbl.setForeground(UITheme.PRIMARY_LIGHT);
        bar.add(brandLbl, BorderLayout.WEST);

        JPanel rightPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 14, 0));
        rightPanel.setOpaque(false);

        xpLbl = new JLabel(candidate.getXpPoints() + " XP");
        xpLbl.setFont(UITheme.FONT_BOLD);
        xpLbl.setForeground(UITheme.WARNING);

        levelLbl = new JLabel("[ " + candidate.getLevel() + " ]");
        levelLbl.setFont(UITheme.FONT_BOLD);
        levelLbl.setForeground(UITheme.ACCENT_CYAN);

        streakLbl = new JLabel("Streak: " + candidate.getStreakCount() + " days");
        streakLbl.setFont(UITheme.FONT_SMALL);
        streakLbl.setForeground(UITheme.TEXT_SECONDARY);

        JButton logoutBtn = UITheme.createDangerButton("  Logout  ");
        logoutBtn.setFont(UITheme.FONT_SMALL);
        logoutBtn.setBorder(new EmptyBorder(7, 14, 7, 14));
        logoutBtn.addActionListener(e -> {
            new LoginScreen(manager).setVisible(true);
            dispose();
        });

        rightPanel.add(streakLbl);
        rightPanel.add(xpLbl);
        rightPanel.add(levelLbl);
        rightPanel.add(logoutBtn);
        bar.add(rightPanel, BorderLayout.EAST);
        return bar;
    }

    // ---- SIDEBAR ----
    private JPanel buildSideBar() {
        JPanel side = new JPanel();
        side.setLayout(new BoxLayout(side, BoxLayout.Y_AXIS));
        side.setBackground(UITheme.BG_CARD);
        side.setBorder(new EmptyBorder(24, 0, 24, 0));
        side.setPreferredSize(new Dimension(220, 0));

        // Profile section
        JPanel profileSection = new JPanel(new GridLayout(4, 1, 0, 4));
        profileSection.setOpaque(false);
        profileSection.setMaximumSize(new Dimension(220, 120));
        profileSection.setBorder(new EmptyBorder(0, 18, 16, 18));

        JLabel avatarLbl = new JLabel(getAvatarInitials(), SwingConstants.CENTER);
        avatarLbl.setFont(new Font("Segoe UI", Font.BOLD, 30));
        avatarLbl.setForeground(Color.WHITE);
        avatarLbl.setOpaque(true);
        avatarLbl.setBackground(UITheme.PRIMARY);
        avatarLbl.setPreferredSize(new Dimension(64, 64));

        JPanel avatarWrapper = new JPanel(new FlowLayout(FlowLayout.CENTER, 0, 0));
        avatarWrapper.setOpaque(false);
        avatarWrapper.add(avatarLbl);

        JLabel nameLbl = new JLabel(candidate.getName(), SwingConstants.CENTER);
        nameLbl.setFont(UITheme.FONT_SUBTITLE);
        nameLbl.setForeground(UITheme.TEXT_PRIMARY);

        JLabel rollLbl = new JLabel(candidate.getRollNumber() + "  |  " + candidate.getBranch(), SwingConstants.CENTER);
        rollLbl.setFont(UITheme.FONT_TINY);
        rollLbl.setForeground(UITheme.TEXT_MUTED);

        JLabel lvlBadge = new JLabel("  " + candidate.getLevel() + "  ", SwingConstants.CENTER);
        lvlBadge.setFont(UITheme.FONT_BOLD);
        lvlBadge.setForeground(UITheme.TEXT_PRIMARY);
        lvlBadge.setOpaque(true);
        lvlBadge.setBackground(UITheme.PRIMARY);
        lvlBadge.setBorder(new EmptyBorder(3, 8, 3, 8));

        JPanel lvlRow = new JPanel(new FlowLayout(FlowLayout.CENTER, 0, 0));
        lvlRow.setOpaque(false);
        lvlRow.add(lvlBadge);

        profileSection.add(avatarWrapper);
        profileSection.add(nameLbl);
        profileSection.add(rollLbl);
        profileSection.add(lvlRow);
        side.add(profileSection);

        // XP Bar
        JPanel xpSection = new JPanel(new BorderLayout(0, 4));
        xpSection.setOpaque(false);
        xpSection.setMaximumSize(new Dimension(220, 60));
        xpSection.setBorder(new EmptyBorder(0, 18, 16, 18));
        int xp = candidate.getXpPoints();
        int nextLvlXp = nextLevelXP(xp);
        int prevLvlXp = prevLevelXP(xp);
        JLabel xpProgLabel = new JLabel(xp + " / " + nextLvlXp + " XP", SwingConstants.LEFT);
        xpProgLabel.setFont(UITheme.FONT_TINY);
        xpProgLabel.setForeground(UITheme.WARNING);
        JProgressBar xpBar = UITheme.createProgressBar(prevLvlXp, nextLvlXp, UITheme.WARNING);
        xpBar.setValue(Math.min(xp, nextLvlXp));
        xpBar.setPreferredSize(new Dimension(0, 8));
        xpSection.add(xpProgLabel, BorderLayout.NORTH);
        xpSection.add(xpBar, BorderLayout.CENTER);
        side.add(xpSection);

        // Separator
        JSeparator sep = new JSeparator(SwingConstants.HORIZONTAL);
        sep.setForeground(UITheme.BORDER_COLOR);
        sep.setBackground(UITheme.BORDER_COLOR);
        sep.setMaximumSize(new Dimension(220, 2));
        side.add(sep);
        side.add(Box.createVerticalStrut(12));

        // Nav buttons
        String[][] navItems = {
            {"  Dashboard", "dashboard"},
            {"  Analytics", "analytics"},
            {"  History", "history"}
        };
        for (String[] item : navItems) {
            JButton navBtn = createNavButton(item[0], item[1]);
            side.add(navBtn);
            side.add(Box.createVerticalStrut(4));
        }

        side.add(Box.createVerticalGlue());

        // Badges section
        List<String> badges = new java.util.ArrayList<>(candidate.getUnlockedBadges());
        if (!badges.isEmpty()) {
            JSeparator sep2 = new JSeparator(SwingConstants.HORIZONTAL);
            sep2.setForeground(UITheme.BORDER_COLOR);
            sep2.setMaximumSize(new Dimension(220, 2));
            side.add(sep2);
            side.add(Box.createVerticalStrut(12));
            JLabel badgesTitle = new JLabel("  Badges Earned", SwingConstants.LEFT);
            badgesTitle.setFont(UITheme.FONT_BOLD);
            badgesTitle.setForeground(UITheme.TEXT_MUTED);
            badgesTitle.setMaximumSize(new Dimension(220, 25));
            side.add(badgesTitle);
            side.add(Box.createVerticalStrut(6));
            for (String badge : badges) {
                JLabel badgeLbl = new JLabel("  \u2605 " + badge, SwingConstants.LEFT);
                badgeLbl.setFont(UITheme.FONT_TINY);
                badgeLbl.setForeground(UITheme.WARNING);
                badgeLbl.setMaximumSize(new Dimension(220, 22));
                side.add(badgeLbl);
            }
        }
        return side;
    }

    private JButton createNavButton(String text, String id) {
        JButton btn = new JButton(text);
        btn.setFont(UITheme.FONT_REGULAR);
        btn.setForeground(UITheme.TEXT_SECONDARY);
        btn.setBackground(UITheme.BG_CARD);
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setContentAreaFilled(true);
        btn.setHorizontalAlignment(SwingConstants.LEFT);
        btn.setMaximumSize(new Dimension(220, 40));
        btn.setPreferredSize(new Dimension(220, 40));
        btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        btn.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent e) {
                btn.setForeground(UITheme.TEXT_PRIMARY);
                btn.setBackground(UITheme.BG_CARD_ALT);
            }
            public void mouseExited(java.awt.event.MouseEvent e) {
                btn.setForeground(UITheme.TEXT_SECONDARY);
                btn.setBackground(UITheme.BG_CARD);
            }
        });
        btn.addActionListener(e -> {
            if ("analytics".equals(id)) new AnalyticsScreen(candidate, manager).setVisible(true);
            else if ("history".equals(id)) new HistoryScreen(candidate, manager).setVisible(true);
        });
        return btn;
    }

    // ---- MAIN CONTENT ----
    private JPanel buildMainContent() {
        JScrollPane scroll = new JScrollPane();
        JPanel content = new JPanel();
        content.setLayout(new BoxLayout(content, BoxLayout.Y_AXIS));
        content.setBackground(UITheme.BG_DARK);
        content.setBorder(new EmptyBorder(24, 28, 28, 28));

        // Welcome banner
        JPanel welcomeBanner = new JPanel(new BorderLayout());
        welcomeBanner.setBackground(new Color(30, 58, 95));
        welcomeBanner.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.PRIMARY, 1, true),
            new EmptyBorder(20, 24, 20, 24)
        ));
        welcomeBanner.setMaximumSize(new Dimension(Short.MAX_VALUE, 90));

        JLabel wTitle = new JLabel("Welcome back, " + candidate.getName() + "!");
        wTitle.setFont(UITheme.FONT_TITLE);
        wTitle.setForeground(UITheme.TEXT_PRIMARY);

        JLabel wSub = new JLabel("Keep going! Consistent practice is the key to placement success.");
        wSub.setFont(UITheme.FONT_SMALL);
        wSub.setForeground(UITheme.TEXT_SECONDARY);

        JPanel wText = new JPanel(new GridLayout(2, 1, 0, 5));
        wText.setOpaque(false);
        wText.add(wTitle);
        wText.add(wSub);
        welcomeBanner.add(wText, BorderLayout.CENTER);

        JButton dailyBtn = UITheme.createSuccessButton("  Daily Challenge  ");
        dailyBtn.setFont(UITheme.FONT_BOLD);
        dailyBtn.addActionListener(this::launchDailyChallenge);
        JPanel btnWrap = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 10));
        btnWrap.setOpaque(false);
        btnWrap.add(dailyBtn);
        welcomeBanner.add(btnWrap, BorderLayout.EAST);

        content.add(welcomeBanner);
        content.add(Box.createVerticalStrut(20));

        // Stats row
        List<model.AssessmentSessionReport> hist = candidate.getAssessmentHistory();
        int testCount = hist.size();
        double avgScore = candidate.getAverageScore();
        int bestScore = candidate.getBestScore();

        JPanel statsRow = new JPanel(new GridLayout(1, 4, 14, 14));
        statsRow.setOpaque(false);
        statsRow.setMaximumSize(new Dimension(Short.MAX_VALUE, 100));
        statsRow.add(UITheme.createStatCard("Tests Taken", String.valueOf(testCount), UITheme.PRIMARY));
        statsRow.add(UITheme.createStatCard("Average Score", String.format("%.1f%%", avgScore), UITheme.ACCENT_CYAN));
        statsRow.add(UITheme.createStatCard("Best Score", bestScore + "%", UITheme.SUCCESS));
        statsRow.add(UITheme.createStatCard("Total XP Earned", candidate.getXpPoints() + " XP", UITheme.WARNING));
        content.add(statsRow);
        content.add(Box.createVerticalStrut(22));

        // Section heading - Domain Tests
        JLabel domainHeading = new JLabel("  Domain Assessment Tests");
        domainHeading.setFont(UITheme.FONT_TITLE);
        domainHeading.setForeground(UITheme.TEXT_PRIMARY);
        domainHeading.setMaximumSize(new Dimension(Short.MAX_VALUE, 32));
        content.add(domainHeading);
        content.add(Box.createVerticalStrut(12));

        // Domain test tiles
        Object[][] domains = {
            {"Aptitude", "Percentages, P&L, Time & Work, Probability, Clocks", UITheme.PRIMARY, "APTITUDE", 213},
            {"Logical Reasoning", "Syllogisms, Blood Relations, Series, Direction, Puzzles", UITheme.ACCENT_PURPLE, "LOGICAL", 160},
            {"Java Programming", "OOP, Collections, Threads, Exceptions, Code Snippets", UITheme.SUCCESS, "JAVA", 210},
            {"DBMS", "SQL, Normalization, ACID, Transactions, Indexing, Keys", UITheme.WARNING, "DBMS", 160},
            {"CS Fundamentals", "Operating Systems, Networks, Data Structures, Algorithms", UITheme.ACCENT_CYAN, "CS", 120},
        };

        JPanel domainGrid = new JPanel(new GridLayout(2, 3, 14, 14));
        domainGrid.setOpaque(false);
        domainGrid.setMaximumSize(new Dimension(Short.MAX_VALUE, 220));
        for (Object[] dom : domains) {
            domainGrid.add(createDomainTile(
                (String)dom[0], (String)dom[1], (Color)dom[2], (String)dom[3], (int)dom[4]));
        }
        content.add(domainGrid);
        content.add(Box.createVerticalStrut(22));

        // Section heading - Company Mocks
        JLabel companyHeading = new JLabel("  Company Mock Tests");
        companyHeading.setFont(UITheme.FONT_TITLE);
        companyHeading.setForeground(UITheme.TEXT_PRIMARY);
        companyHeading.setMaximumSize(new Dimension(Short.MAX_VALUE, 32));
        content.add(companyHeading);
        content.add(Box.createVerticalStrut(12));

        Object[][] companies = {
            {"TCS NQT", "Aptitude + Reasoning + Java", new Color(0, 130, 75)},
            {"Infosys", "Aptitude + Reasoning + DBMS", new Color(0, 116, 182)},
            {"Wipro", "Aptitude + Java + CS", new Color(150, 48, 132)},
            {"Accenture", "Aptitude + Reasoning + Java", new Color(166, 0, 79)},
            {"Cognizant", "Aptitude + Java + DBMS", new Color(18, 110, 130)},
            {"Capgemini", "Aptitude + Reasoning + CS", new Color(0, 73, 144)},
        };
        JPanel companyGrid = new JPanel(new GridLayout(1, 6, 12, 12));
        companyGrid.setOpaque(false);
        companyGrid.setMaximumSize(new Dimension(Short.MAX_VALUE, 100));
        for (Object[] co : companies) {
            companyGrid.add(createCompanyTile((String)co[0], (String)co[1], (Color)co[2]));
        }
        content.add(companyGrid);

        scroll.setViewportView(content);
        scroll.setBackground(UITheme.BG_DARK);
        scroll.getViewport().setBackground(UITheme.BG_DARK);
        scroll.setBorder(null);

        JPanel wrapper = new JPanel(new BorderLayout());
        wrapper.setBackground(UITheme.BG_DARK);
        wrapper.add(scroll);
        return wrapper;
    }

    private JPanel createDomainTile(String name, String desc, Color accent, String domain, int qCount) {
        JPanel card = new JPanel(new BorderLayout(0, 8));
        card.setBackground(UITheme.BG_CARD);
        card.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.BORDER_COLOR, 1, true),
            new EmptyBorder(16, 16, 16, 16)
        ));
        card.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));

        JPanel accentBar = new JPanel();
        accentBar.setBackground(accent);
        accentBar.setPreferredSize(new Dimension(0, 4));
        card.add(accentBar, BorderLayout.NORTH);

        JPanel center = new JPanel(new GridLayout(3, 1, 0, 4));
        center.setOpaque(false);

        JLabel nameLbl = new JLabel(name);
        nameLbl.setFont(UITheme.FONT_SUBTITLE);
        nameLbl.setForeground(UITheme.TEXT_PRIMARY);

        JLabel descLbl = new JLabel("<html><body style='width:160px;color:#94A3B8;font-size:11px;'>" + desc + "</body></html>");
        descLbl.setFont(UITheme.FONT_TINY);
        descLbl.setForeground(UITheme.TEXT_MUTED);

        JLabel countLbl = new JLabel(qCount + " Questions");
        countLbl.setFont(UITheme.FONT_TINY);
        countLbl.setForeground(accent);

        center.add(nameLbl);
        center.add(descLbl);
        center.add(countLbl);
        card.add(center, BorderLayout.CENTER);

        JButton startBtn = UITheme.createPrimaryButton("Start Test");
        startBtn.setFont(UITheme.FONT_SMALL);
        startBtn.setBorder(new EmptyBorder(8, 16, 8, 16));
        startBtn.addActionListener(e -> launchDomainTest(domain));
        card.add(startBtn, BorderLayout.SOUTH);

        // Hover effect on card
        card.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent e) { card.setBorder(BorderFactory.createCompoundBorder(new LineBorder(accent, 2, true), new EmptyBorder(15, 15, 15, 15))); }
            public void mouseExited(java.awt.event.MouseEvent e)  { card.setBorder(BorderFactory.createCompoundBorder(new LineBorder(UITheme.BORDER_COLOR, 1, true), new EmptyBorder(16, 16, 16, 16))); }
        });
        return card;
    }

    private JPanel createCompanyTile(String name, String domains, Color accent) {
        JPanel card = new JPanel(new BorderLayout(0, 6));
        card.setBackground(UITheme.BG_CARD);
        card.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.BORDER_COLOR, 1, true),
            new EmptyBorder(12, 12, 12, 12)
        ));
        card.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));

        JLabel nameLbl = new JLabel(name, SwingConstants.CENTER);
        nameLbl.setFont(UITheme.FONT_BOLD);
        nameLbl.setForeground(UITheme.TEXT_PRIMARY);

        JLabel domainsLbl = new JLabel("<html><center><font size='2' color='#94A3B8'>" + domains + "</font></center></html>", SwingConstants.CENTER);
        domainsLbl.setFont(UITheme.FONT_TINY);

        JButton btn = UITheme.createPrimaryButton("Start");
        btn.setFont(UITheme.FONT_TINY);
        btn.setBorder(new EmptyBorder(6, 12, 6, 12));
        btn.setBackground(accent);
        btn.addActionListener(e -> launchCompanyMock(name));

        card.add(nameLbl, BorderLayout.NORTH);
        card.add(domainsLbl, BorderLayout.CENTER);
        card.add(btn, BorderLayout.SOUTH);

        card.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent e) { card.setBorder(BorderFactory.createCompoundBorder(new LineBorder(accent, 2, true), new EmptyBorder(11, 11, 11, 11))); }
            public void mouseExited(java.awt.event.MouseEvent e)  { card.setBorder(BorderFactory.createCompoundBorder(new LineBorder(UITheme.BORDER_COLOR, 1, true), new EmptyBorder(12, 12, 12, 12))); }
        });
        return card;
    }

    // ---- LAUNCH HELPERS ----
    private void launchDomainTest(String domain) {
        Assessment assessment = switch (domain) {
            case "APTITUDE" -> new AptitudeAssessment();
            case "LOGICAL"  -> new LogicalReasoningAssessment();
            case "JAVA"     -> new JavaAssessment();
            case "DBMS"     -> new DBMSAssessment();
            case "CS"       -> new CSFundamentalsAssessment();
            default         -> new AptitudeAssessment();
        };
        manager.startAssessment(assessment, manager.getAllQuestions());
        new MCQAssessmentScreen(this, candidate, manager, assessment).setVisible(true);
        this.setVisible(false);
    }

    private void launchCompanyMock(String company) {
        CompanyMockAssessment mock = new CompanyMockAssessment(company);
        manager.startAssessment(mock, manager.getAllQuestions());
        new MCQAssessmentScreen(this, candidate, manager, mock).setVisible(true);
        this.setVisible(false);
    }

    private void launchDailyChallenge(ActionEvent e) {
        List<model.Question> daily = manager.getDailyChallengeQuestions();
        if (daily.isEmpty()) {
            JOptionPane.showMessageDialog(this, "No daily challenge questions available today.", "Daily Challenge", JOptionPane.INFORMATION_MESSAGE);
            return;
        }
        AptitudeAssessment da = new AptitudeAssessment();
        da.setDailyChallenge(true);
        manager.startAssessmentFromList(da, daily);
        new MCQAssessmentScreen(this, candidate, manager, da).setVisible(true);
        this.setVisible(false);
    }

    private String getAvatarInitials() {
        String name = candidate.getName();
        if (name == null || name.isEmpty()) return "?";
        String[] parts = name.trim().split("\\s+");
        if (parts.length >= 2) return String.valueOf(parts[0].charAt(0)) + parts[1].charAt(0);
        return name.substring(0, Math.min(2, name.length())).toUpperCase();
    }

    private int nextLevelXP(int xp) {
        if (xp < 500) return 500;
        if (xp < 1500) return 1500;
        if (xp < 3000) return 3000;
        return xp + 500;
    }

    private int prevLevelXP(int xp) {
        if (xp < 500) return 0;
        if (xp < 1500) return 500;
        if (xp < 3000) return 1500;
        return 3000;
    }
}
