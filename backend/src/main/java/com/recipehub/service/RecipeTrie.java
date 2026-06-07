package com.recipehub.service;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class RecipeTrie {

    private final TrieNode root = new TrieNode();

    // 레시피 제목 삽입
    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toLowerCase().toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        node.isEnd = true;
        node.word = word;
    }

    // 접두사로 자동완성 목록 반환 (전위순회)
    public List<String> autocomplete(String prefix, int limit) {
        TrieNode node = root;
        for (char c : prefix.toLowerCase().toCharArray()) {
            if (!node.children.containsKey(c)) return Collections.emptyList();
            node = node.children.get(c);
        }
        List<String> results = new ArrayList<>();
        dfs(node, results, limit);
        return results;
    }

    // 전위순회(Preorder): 현재 노드 먼저 처리 후 자식 탐색
    private void dfs(TrieNode node, List<String> results, int limit) {
        if (results.size() >= limit) return;
        if (node.isEnd) results.add(node.word);
        for (TrieNode child : node.children.values()) {
            dfs(child, results, limit);
        }
    }

    public void delete(String word) {
        deleteHelper(root, word.toLowerCase(), 0);
    }

    private boolean deleteHelper(TrieNode node, String word, int depth) {
        if (depth == word.length()) {
            if (!node.isEnd) return false;
            node.isEnd = false;
            node.word = null;
            return node.children.isEmpty();
        }
        char c = word.charAt(depth);
        TrieNode child = node.children.get(c);
        if (child == null) return false;
        boolean shouldDelete = deleteHelper(child, word, depth + 1);
        if (shouldDelete) node.children.remove(c);
        return shouldDelete && !node.isEnd;
    }

    private static class TrieNode {
        Map<Character, TrieNode> children = new LinkedHashMap<>();
        boolean isEnd = false;
        String word = null;
    }
}
