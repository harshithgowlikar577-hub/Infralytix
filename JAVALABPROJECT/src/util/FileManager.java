package util;

import model.AssessmentSessionReport;
import model.Candidate;
import model.Question;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.*;

/**
 * File management utility handling text-based data persistence.
 * Uses pure Java File I/O (BufferedReader, BufferedWriter, FileReader, FileWriter, UTF-8).
 */
public class FileManager {

    private final String dataDirPath;
    private final File questionsFile;
    private final File usersFile;
    private final File historyFile;

    public FileManager() {
        this.dataDirPath = resolveDataDirectory();
        File dataDir = new File(dataDirPath);
        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }

        this.questionsFile = new File(dataDir, "questions.txt");
        this.usersFile = new File(dataDir, "users.txt");
        this.historyFile = new File(dataDir, "history.txt");

        initializeDefaultsIfNeeded();
    }

    private String resolveDataDirectory() {
        File directData = new File("data");
        if (directData.exists()) {
            return directData.getAbsolutePath();
        }
        File parentData = new File(".." + File.separator + "data");
        if (parentData.exists()) {
            return parentData.getAbsolutePath();
        }
        return Paths.get(System.getProperty("user.dir"), "data").toString();
    }

    private void initializeDefaultsIfNeeded() {
        if (!usersFile.exists() || usersFile.length() == 0) {
            saveDefaultUsers();
        }
        if (!historyFile.exists()) {
            try {
                historyFile.createNewFile();
            } catch (IOException e) {
                System.err.println("Could not create history.txt: " + e.getMessage());
            }
        }
    }

    public List<Question> loadQuestions() {
        List<Question> list = new ArrayList<>();
        if (!questionsFile.exists()) {
            System.err.println("Warning: questions.txt does not exist at " + questionsFile.getAbsolutePath());
            return list;
        }

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new FileInputStream(questionsFile), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;

                Question q = Question.fromPipeDelimited(line);
                if (q != null) {
                    list.add(q);
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading questions: " + e.getMessage());
        }

        return list;
    }

    public Map<String, Candidate> loadUsers() {
        Map<String, Candidate> map = new HashMap<>();
        if (!usersFile.exists()) return map;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new FileInputStream(usersFile), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;

                Candidate c = Candidate.fromPipeDelimited(line);
                if (c != null) {
                    map.put(c.getUsername().toLowerCase(), c);
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading users: " + e.getMessage());
        }
        return map;
    }

    public synchronized boolean saveUser(Candidate candidate) {
        if (candidate == null) return false;
        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream(usersFile, true), StandardCharsets.UTF_8))) {
            writer.write(candidate.toPipeDelimited());
            writer.newLine();
            return true;
        } catch (IOException e) {
            System.err.println("Error saving user: " + e.getMessage());
            return false;
        }
    }

    public synchronized boolean updateUser(Candidate candidate) {
        if (candidate == null) return false;
        Map<String, Candidate> users = loadUsers();
        users.put(candidate.getUsername().toLowerCase(), candidate);

        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream(usersFile, false), StandardCharsets.UTF_8))) {
            for (Candidate c : users.values()) {
                writer.write(c.toPipeDelimited());
                writer.newLine();
            }
            return true;
        } catch (IOException e) {
            System.err.println("Error updating user: " + e.getMessage());
            return false;
        }
    }

    public Candidate authenticate(String username, String password) throws InvalidLoginException {
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new InvalidLoginException("Username and password must not be empty.");
        }

        Map<String, Candidate> users = loadUsers();
        Candidate candidate = users.get(username.trim().toLowerCase());

        if (candidate == null) {
            throw new InvalidLoginException("User '" + username + "' is not registered. Please register first.");
        }

        if (!candidate.getPassword().equals(password)) {
            throw new InvalidLoginException("Invalid password. Please verify your credentials.");
        }

        // Attach history
        List<AssessmentSessionReport> history = loadHistory(candidate.getUsername());
        candidate.setAssessmentHistory(history);

        return candidate;
    }

    public List<AssessmentSessionReport> loadHistory(String targetUsername) {
        List<AssessmentSessionReport> list = new ArrayList<>();
        if (!historyFile.exists()) return list;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new FileInputStream(historyFile), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;

                String[] parts = line.split("\\|", -1);
                // recordId|username|timestamp|domain|difficulty|percentage|totalQuestions|correctCount|wrongCount|netScore|weakAreas
                if (parts.length >= 7) {
                    String recId = parts[0].trim();
                    String user = parts[1].trim();
                    String time = parts[2].trim();
                    String domain = parts[3].trim();
                    String diff = parts[4].trim();
                    int pct = Integer.parseInt(parts[5].trim());
                    int total = Integer.parseInt(parts[6].trim());

                    if (targetUsername == null || targetUsername.equalsIgnoreCase(user)) {
                        AssessmentSessionReport r = new AssessmentSessionReport(recId, user, time, domain, diff);
                        // reconstruct approximate aggregates
                        int correct = (parts.length >= 8) ? Integer.parseInt(parts[7].trim()) : (int) ((pct / 100.0) * total);
                        int wrong = (parts.length >= 9) ? Integer.parseInt(parts[8].trim()) : (total - correct);
                        double score = (parts.length >= 10) ? Double.parseDouble(parts[9].trim()) : (correct * 1.0 - wrong * 0.25);
                        String weak = (parts.length >= 11) ? parts[10].trim() : "";

                        // Inject evaluations placeholders so getPercentage() works
                        for (int i = 0; i < correct; i++) {
                            Question q = new Question(i, domain, "General", diff, "Q" + i, "A", "B", "C", "D", 'A', "");
                            r.addEvaluation(new model.MCQEvaluation(q, 'A', 15));
                        }
                        for (int i = 0; i < wrong; i++) {
                            Question q = new Question(correct + i, domain, "General", diff, "Q" + i, "A", "B", "C", "D", 'A', "");
                            r.addEvaluation(new model.MCQEvaluation(q, 'B', 20));
                        }
                        r.computeAggregates();
                        if (!weak.isEmpty() && !weak.equalsIgnoreCase("None")) {
                            r.getWeakAreas().addAll(Arrays.asList(weak.split(";")));
                        }
                        list.add(r);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Notice reading history file: " + e.getMessage());
        }
        return list;
    }

    public synchronized boolean appendHistory(AssessmentSessionReport report) {
        if (report == null) return false;
        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream(historyFile, true), StandardCharsets.UTF_8))) {
            writer.write(report.toHistoryLine());
            writer.newLine();
            return true;
        } catch (IOException e) {
            System.err.println("Error saving history: " + e.getMessage());
            return false;
        }
    }

    private void saveDefaultUsers() {
        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream(usersFile), StandardCharsets.UTF_8))) {
            writer.write("admin|admin123|Harsh Vardhan|23CS101|Computer Science and Engineering|350|Intermediate|3|2026-09-22|Speed Demon,Aptitude Ace");
            writer.newLine();
            writer.write("student|pass123|Rahul Sharma|23CS142|Information Technology|120|Beginner|1|2026-09-22|");
            writer.newLine();
            writer.write("priya|priya123|Priya Verma|23EC088|Electronics and Communication|520|Advanced|5|2026-09-22|Java Maestro,Streak Legend");
            writer.newLine();
        } catch (IOException e) {
            System.err.println("Error saving default users: " + e.getMessage());
        }
    }

    public File getDataDir() { return new File(dataDirPath); }
}
