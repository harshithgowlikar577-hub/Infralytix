package gui;

import model.Candidate;
import service.AssessmentManager;
import util.InvalidLoginException;
import util.UITheme;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;
import java.awt.event.ActionEvent;

/**
 * Login Screen - Professional dark-themed authentication portal.
 */
public class LoginScreen extends JFrame {

    private AssessmentManager manager;
    private JTextField userField;
    private JPasswordField passField;
    private JButton loginBtn;
    private JButton registerBtn;
    private JLabel statusLbl;

    public LoginScreen(AssessmentManager manager) {
        this.manager = manager;
        setTitle("AI Interview Simulator & Placement Assessment Platform");
        setSize(500, 620);
        setMinimumSize(new Dimension(440, 560));
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        getContentPane().setBackground(UITheme.BG_DARK);
        setLayout(new BorderLayout());
        initUI();
    }

    private void initUI() {
        // ---- HEADER PANEL ----
        JPanel headerPanel = new JPanel(new GridLayout(4, 1, 4, 4));
        headerPanel.setBackground(UITheme.BG_DARK);
        headerPanel.setBorder(new EmptyBorder(40, 40, 20, 40));

        JLabel iconLbl = new JLabel("[AI]", SwingConstants.CENTER);
        iconLbl.setFont(new Font("Segoe UI", Font.BOLD, 36));
        iconLbl.setForeground(UITheme.PRIMARY);

        JLabel titleLbl = new JLabel("Placement Assessment Platform", SwingConstants.CENTER);
        titleLbl.setFont(UITheme.FONT_HEADER_LARGE);
        titleLbl.setForeground(UITheme.TEXT_PRIMARY);

        JLabel subLbl = new JLabel("TCS NQT | Infosys | Wipro | Accenture | Cognizant | Capgemini", SwingConstants.CENTER);
        subLbl.setFont(UITheme.FONT_SMALL);
        subLbl.setForeground(UITheme.ACCENT_CYAN);

        JLabel tagLbl = new JLabel("Sign in to start your placement preparation", SwingConstants.CENTER);
        tagLbl.setFont(UITheme.FONT_MEDIUM);
        tagLbl.setForeground(UITheme.TEXT_MUTED);

        headerPanel.add(iconLbl);
        headerPanel.add(titleLbl);
        headerPanel.add(subLbl);
        headerPanel.add(tagLbl);
        add(headerPanel, BorderLayout.NORTH);

        // ---- FORM CARD ----
        JPanel formCard = new JPanel(new GridBagLayout());
        formCard.setBackground(UITheme.BG_CARD);
        formCard.setBorder(BorderFactory.createCompoundBorder(
            new LineBorder(UITheme.BORDER_COLOR, 1, true),
            new EmptyBorder(28, 32, 28, 32)
        ));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.gridx = 0;
        gbc.weightx = 1.0;
        gbc.insets = new Insets(4, 0, 4, 0);

        // Username label
        JLabel uLbl = new JLabel("Username / Student ID");
        uLbl.setFont(UITheme.FONT_BOLD);
        uLbl.setForeground(UITheme.TEXT_SECONDARY);
        gbc.gridy = 0;
        formCard.add(uLbl, gbc);

        // Username field
        userField = UITheme.createTextField(20);
        userField.setText("admin");
        gbc.gridy = 1;
        gbc.insets = new Insets(4, 0, 14, 0);
        formCard.add(userField, gbc);

        // Password label
        JLabel pLbl = new JLabel("Password");
        pLbl.setFont(UITheme.FONT_BOLD);
        pLbl.setForeground(UITheme.TEXT_SECONDARY);
        gbc.gridy = 2;
        gbc.insets = new Insets(4, 0, 4, 0);
        formCard.add(pLbl, gbc);

        // Password field
        passField = UITheme.createPasswordField(20);
        passField.setText("admin123");
        gbc.gridy = 3;
        gbc.insets = new Insets(4, 0, 20, 0);
        formCard.add(passField, gbc);

        // Login button
        loginBtn = UITheme.createPrimaryButton("  Sign In to Simulator  ");
        loginBtn.setFont(new Font("Segoe UI", Font.BOLD, 15));
        loginBtn.addActionListener(this::handleLogin);
        gbc.gridy = 4;
        gbc.insets = new Insets(4, 0, 10, 0);
        formCard.add(loginBtn, gbc);

        // Register button
        registerBtn = UITheme.createSecondaryButton("  Create New Candidate Account  ");
        registerBtn.addActionListener(this::handleRegisterDialog);
        gbc.gridy = 5;
        gbc.insets = new Insets(4, 0, 16, 0);
        formCard.add(registerBtn, gbc);

        // Divider
        JSeparator sep = new JSeparator();
        sep.setForeground(UITheme.BORDER_COLOR);
        sep.setBackground(UITheme.BORDER_COLOR);
        gbc.gridy = 6;
        gbc.insets = new Insets(0, 0, 14, 0);
        formCard.add(sep, gbc);

        // Hint
        JLabel hintLbl = new JLabel(
            "<html><center><font color='#94A3B8'>Demo:&nbsp;<b><font color='#60A5FA'>admin / admin123</font></b>"
            + "&nbsp;&nbsp;or&nbsp;&nbsp;<b><font color='#60A5FA'>student / pass123</font></b></font></center></html>",
            SwingConstants.CENTER);
        hintLbl.setFont(UITheme.FONT_SMALL);
        gbc.gridy = 7;
        gbc.insets = new Insets(0, 0, 0, 0);
        formCard.add(hintLbl, gbc);

        // Status message
        statusLbl = new JLabel(" ", SwingConstants.CENTER);
        statusLbl.setFont(UITheme.FONT_SMALL);
        statusLbl.setForeground(UITheme.DANGER);
        gbc.gridy = 8;
        gbc.insets = new Insets(10, 0, 0, 0);
        formCard.add(statusLbl, gbc);

        JPanel centerWrapper = new JPanel(new GridBagLayout());
        centerWrapper.setBackground(UITheme.BG_DARK);
        centerWrapper.setBorder(new EmptyBorder(10, 30, 30, 30));
        centerWrapper.add(formCard);
        add(centerWrapper, BorderLayout.CENTER);

        // Enter key submits login
        getRootPane().setDefaultButton(loginBtn);

        // Footer
        JLabel footer = new JLabel("AI Interview Simulator v2.0  |  Java Swing  |  100% Local  |  No Internet Required",
            SwingConstants.CENTER);
        footer.setFont(UITheme.FONT_TINY);
        footer.setForeground(UITheme.TEXT_DISABLED);
        footer.setBorder(new EmptyBorder(0, 0, 12, 0));
        add(footer, BorderLayout.SOUTH);
    }

    private void handleLogin(ActionEvent e) {
        String u = userField.getText().trim();
        String p = new String(passField.getPassword()).trim();
        statusLbl.setText(" ");

        if (u.isEmpty() || p.isEmpty()) {
            statusLbl.setText("Please enter both username and password.");
            return;
        }
        try {
            Candidate candidate = manager.getFileManager().authenticate(u, p);
            statusLbl.setForeground(UITheme.SUCCESS);
            statusLbl.setText("Welcome back, " + candidate.getName() + "! Loading dashboard...");
            loginBtn.setEnabled(false);
            registerBtn.setEnabled(false);
            Timer delay = new Timer(600, ev -> {
                new MainDashboard(candidate, manager).setVisible(true);
                this.dispose();
            });
            delay.setRepeats(false);
            delay.start();
        } catch (InvalidLoginException ex) {
            statusLbl.setForeground(UITheme.DANGER);
            statusLbl.setText(ex.getMessage());
            passField.setText("");
            passField.requestFocus();
        }
    }

    private void handleRegisterDialog(ActionEvent e) {
        JDialog dialog = new JDialog(this, "Create New Candidate Account", true);
        dialog.setSize(420, 380);
        dialog.setLocationRelativeTo(this);
        dialog.getContentPane().setBackground(UITheme.BG_DARK);
        dialog.setLayout(new BorderLayout());

        JLabel dlgTitle = new JLabel("  New Candidate Registration", SwingConstants.LEFT);
        dlgTitle.setFont(UITheme.FONT_TITLE);
        dlgTitle.setForeground(UITheme.TEXT_PRIMARY);
        dlgTitle.setBackground(UITheme.BG_CARD);
        dlgTitle.setOpaque(true);
        dlgTitle.setBorder(new EmptyBorder(16, 20, 16, 20));
        dialog.add(dlgTitle, BorderLayout.NORTH);

        JPanel form = new JPanel(new GridBagLayout());
        form.setBackground(UITheme.BG_DARK);
        form.setBorder(new EmptyBorder(16, 20, 16, 20));
        GridBagConstraints g = new GridBagConstraints();
        g.fill = GridBagConstraints.HORIZONTAL;
        g.weightx = 1.0;
        g.insets = new Insets(4, 0, 4, 0);

        JTextField regUser   = UITheme.createTextField(15);
        JPasswordField regPass = UITheme.createPasswordField(15);
        JTextField regName   = UITheme.createTextField(15);
        JTextField regRoll   = UITheme.createTextField(15);
        JTextField regBranch = UITheme.createTextField(15);

        String[][] fields = {{"Username *", null}, {"Password *", null}, {"Full Name *", null}, {"Roll Number", null}, {"Branch / Department", null}};
        Component[] comps = {regUser, regPass, regName, regRoll, regBranch};
        for (int i = 0; i < fields.length; i++) {
            JLabel lbl = new JLabel(fields[i][0]);
            lbl.setFont(UITheme.FONT_BOLD);
            lbl.setForeground(UITheme.TEXT_SECONDARY);
            g.gridx = 0; g.gridy = i * 2;
            form.add(lbl, g);
            g.gridy = i * 2 + 1;
            form.add(comps[i], g);
        }
        dialog.add(form, BorderLayout.CENTER);

        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 12));
        btnPanel.setBackground(UITheme.BG_CARD);
        JButton cancelBtn = UITheme.createSecondaryButton("Cancel");
        JButton createBtn = UITheme.createPrimaryButton("Create Account");
        cancelBtn.addActionListener(ev -> dialog.dispose());
        createBtn.addActionListener(ev -> {
            String u2 = regUser.getText().trim();
            String p2 = new String(regPass.getPassword()).trim();
            String n  = regName.getText().trim();
            String r  = regRoll.getText().trim();
            String b  = regBranch.getText().trim();
            if (u2.isEmpty() || p2.isEmpty() || n.isEmpty()) {
                JOptionPane.showMessageDialog(dialog, "Username, password, and full name are required.", "Validation Error", JOptionPane.WARNING_MESSAGE);
                return;
            }
            if (manager.getFileManager().loadUsers().containsKey(u2.toLowerCase())) {
                JOptionPane.showMessageDialog(dialog, "Username already taken. Please choose another.", "Duplicate Username", JOptionPane.WARNING_MESSAGE);
                return;
            }
            Candidate newC = new Candidate(u2, p2, n, r, b);
            if (manager.getFileManager().saveUser(newC)) {
                JOptionPane.showMessageDialog(dialog, "Account created! You can now sign in.", "Registration Successful", JOptionPane.INFORMATION_MESSAGE);
                userField.setText(u2);
                passField.setText(p2);
                dialog.dispose();
            } else {
                JOptionPane.showMessageDialog(dialog, "Failed to save account. Please try again.", "Save Error", JOptionPane.ERROR_MESSAGE);
            }
        });
        btnPanel.add(cancelBtn);
        btnPanel.add(createBtn);
        dialog.add(btnPanel, BorderLayout.SOUTH);
        dialog.setVisible(true);
    }
}
