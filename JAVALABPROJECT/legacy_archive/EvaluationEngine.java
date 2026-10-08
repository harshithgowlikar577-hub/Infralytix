package service;

import model.AnswerEvaluation;
import model.Question;
import util.EmptyAnswerException;

import java.util.*;

/**
 * Intelligent Keyword Matching Evaluation Engine.
 * Implements the Evaluator interface.
 * Demonstrates string tokenization, stop-word elimination, stemming heuristics, and scoring algorithms.
 */
public class EvaluationEngine implements Evaluator {

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
            "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
            "below", "between", "both", "but", "by", "can", "cannot", "could", "did", "do",
            "does", "doing", "down", "during", "each", "few", "for", "from", "further",
            "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
            "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its",
            "itself", "let's", "me", "more", "most", "my", "myself", "no", "nor", "not",
            "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
            "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such",
            "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there",
            "these", "they", "this", "those", "through", "to", "too", "under", "until", "up",
            "very", "was", "wasn't", "we", "were", "weren't", "what", "when", "where", "which",
            "while", "who", "whom", "why", "with", "won't", "would", "you", "your", "yours"
    ));

    @Override
    public AnswerEvaluation evaluateAnswer(Question question, String answerText, int timeElapsedSeconds) throws EmptyAnswerException {
        if (answerText == null || answerText.trim().isEmpty()) {
            throw new EmptyAnswerException("Candidate answer cannot be empty. Please provide a response before submitting.");
        }

        String rawCleaned = answerText.trim().toLowerCase();
        // Remove non-alphanumeric punctuation except hyphens
        String sanitizedText = rawCleaned.replaceAll("[^a-zA-Z0-9\\s-]", " ");
        String[] rawTokens = sanitizedText.split("\\s+");

        List<String> validWords = new ArrayList<>();
        Set<String> tokenSet = new HashSet<>();

        for (String token : rawTokens) {
            String word = token.trim();
            if (!word.isEmpty()) {
                validWords.add(word);
                if (!STOP_WORDS.contains(word)) {
                    tokenSet.add(word);
                }
            }
        }

        int wordCount = validWords.size();
        List<String> matched = new ArrayList<>();
        List<String> missed = new ArrayList<>();

        List<String> expectedKeywords = question.getKeywords();
        for (String kw : expectedKeywords) {
            String target = kw.trim().toLowerCase();
            boolean isMatched = false;

            // Direct set match or raw answer substring match
            if (tokenSet.contains(target) || rawCleaned.contains(target)) {
                isMatched = true;
            } else {
                // Approximate stem matching (e.g., "extend" in "extends" or "inheritance" in "inherit")
                for (String word : tokenSet) {
                    if (word.startsWith(target) || target.startsWith(word) ||
                        (target.length() > 4 && word.contains(target.substring(0, 4)))) {
                        isMatched = true;
                        break;
                    }
                }
            }

            if (isMatched) {
                matched.add(kw);
            } else {
                missed.add(kw);
            }
        }

        // Calculate keyword coverage score
        double keywordRatio = expectedKeywords.isEmpty() ? 1.0 : ((double) matched.size() / expectedKeywords.size());
        double baseScore = keywordRatio * 100.0;

        // Depth and elaboration adjustments
        double lengthMultiplier = 1.0;
        if (wordCount < 4) {
            lengthMultiplier = 0.65; // severely under-elaborated
        } else if (wordCount < 10) {
            lengthMultiplier = 0.85; // slightly brief
        } else if (wordCount >= 18) {
            lengthMultiplier = 1.05; // comprehensive elaboration bonus
        }

        int finalScore = (int) Math.round(baseScore * lengthMultiplier);
        finalScore = Math.max(0, Math.min(100, finalScore));

        // Generate qualitative diagnosis feedback
        String feedback;
        if (finalScore >= 85) {
            feedback = "Outstanding response! Excellent command over " + question.getCategory() + " terminology.";
        } else if (finalScore >= 70) {
            feedback = "Solid answer. Demonstrated good understanding; missed concepts: " + (missed.isEmpty() ? "None" : String.join(", ", missed));
        } else if (finalScore >= 50) {
            feedback = "Average response. Foundational understanding present, but lacks depth in key technical points.";
        } else {
            feedback = "Needs Improvement. Review core concepts: " + String.join(", ", missed);
        }

        return new AnswerEvaluation(question, answerText, matched, missed, finalScore, timeElapsedSeconds, feedback);
    }
}
