package com.recipehub.service;

import com.recipehub.domain.recipe.Bookmark;
import com.recipehub.domain.recipe.Recipe;
import com.recipehub.domain.user.User;
import com.recipehub.dto.recipe.RecipeResponse;
import com.recipehub.repository.BookmarkRepository;
import com.recipehub.repository.RecipeRepository;
import com.recipehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    // 즐겨찾기 토글 (있으면 삭제, 없으면 추가)
    @Transactional
    public boolean toggle(String email, Long recipeId) {
        User user = findUser(email);
        Recipe recipe = findRecipe(recipeId);

        if (bookmarkRepository.existsByUserAndRecipe(user, recipe)) {
            bookmarkRepository.deleteByUserAndRecipe(user, recipe);
            return false; // 삭제됨
        } else {
            bookmarkRepository.save(Bookmark.builder().user(user).recipe(recipe).build());
            return true; // 추가됨
        }
    }

    // 즐겨찾기 여부 확인
    @Transactional(readOnly = true)
    public boolean isBookmarked(String email, Long recipeId) {
        User user = findUser(email);
        Recipe recipe = findRecipe(recipeId);
        return bookmarkRepository.existsByUserAndRecipe(user, recipe);
    }

    // 내 즐겨찾기 목록
    @Transactional(readOnly = true)
    public List<RecipeResponse> getMyBookmarks(String email) {
        User user = findUser(email);
        return bookmarkRepository.findByUserOrderByCreatedAtDesc(user)
            .stream()
            .map(b -> RecipeResponse.from(b.getRecipe()))
            .toList();
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private Recipe findRecipe(Long id) {
        return recipeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("레시피를 찾을 수 없습니다."));
    }
}
