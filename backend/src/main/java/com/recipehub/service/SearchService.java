package com.recipehub.service;

import com.recipehub.repository.IngredientAliasRepository;
import com.recipehub.repository.RecipeRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final RecipeRepository recipeRepository;
    private final IngredientAliasRepository aliasRepository;
    private final RecipeTrie trie;

    // 서버 시작 시 기존 레시피 제목 Trie에 로드
    @PostConstruct
    @Transactional(readOnly = true)
    public void initTrie() {
        recipeRepository.findAll().forEach(r -> trie.insert(r.getTitle()));
    }

    // 자동완성 (Trie 전위순회)
    public List<String> autocomplete(String prefix) {
        if (prefix == null || prefix.isBlank()) return List.of();
        return trie.autocomplete(prefix.trim(), 10);
    }

    // 새 레시피 등록 시 Trie에 추가
    public void addToTrie(String title) {
        trie.insert(title);
    }

    // 레시피 삭제 시 Trie에서 제거
    public void removeFromTrie(String title) {
        trie.delete(title);
    }

    // 재료명 표준화 (HashMap 기반 Alias Dictionary)
    @Transactional(readOnly = true)
    public String standardize(String ingredientName) {
        return aliasRepository.findByAlias(ingredientName.trim())
            .map(alias -> alias.getStandardName())
            .orElse(ingredientName);
    }
}
