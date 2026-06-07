package com.recipehub.service;

import com.recipehub.dto.recipe.RecipeResponse;
import com.recipehub.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class RankingService {

    private static final String RANKING_KEY = "recipe:ranking";
    private static final String VIEW_KEY = "recipe:views:";
    private static final int TOP_N = 10;

    private final RedisTemplate<String, Object> redisTemplate;
    private final RecipeRepository recipeRepository;

    // 조회수 증가 + 랭킹 업데이트
    public void incrementViewCount(Long recipeId) {
        try {
            // 조회수 카운트
            redisTemplate.opsForValue().increment(VIEW_KEY + recipeId);
            // Sorted Set에 score +1 (랭킹용)
            redisTemplate.opsForZSet().incrementScore(RANKING_KEY, recipeId.toString(), 1);
        } catch (Exception e) {
            log.warn("Redis 조회수 업데이트 실패 (recipeId={}): {}", recipeId, e.getMessage());
        }
    }

    // 조회수 조회
    public Long getViewCount(Long recipeId) {
        try {
            Object val = redisTemplate.opsForValue().get(VIEW_KEY + recipeId);
            if (val == null) return 0L;
            return Long.parseLong(val.toString());
        } catch (Exception e) {
            log.warn("Redis 조회수 조회 실패: {}", e.getMessage());
            return 0L;
        }
    }

    // 인기 레시피 TOP N (Sorted Set 역순 조회)
    public List<RecipeResponse> getTopRecipes() {
        try {
            Set<ZSetOperations.TypedTuple<Object>> topSet =
                redisTemplate.opsForZSet().reverseRangeWithScores(RANKING_KEY, 0, TOP_N - 1);

            if (topSet == null || topSet.isEmpty()) return List.of();

            List<RecipeResponse> result = new ArrayList<>();
            for (ZSetOperations.TypedTuple<Object> tuple : topSet) {
                try {
                    Long recipeId = Long.parseLong(tuple.getValue().toString());
                    recipeRepository.findById(recipeId).ifPresent(r -> {
                        if (r.getGroup() == null && r.isPublic()) {
                            result.add(RecipeResponse.from(r));
                        }
                    });
                } catch (Exception ignored) {}
            }
            return result;
        } catch (Exception e) {
            log.warn("Redis 랭킹 조회 실패: {}", e.getMessage());
            return recipeRepository.findByIsPublicTrueAndGroupIsNull(
                org.springframework.data.domain.PageRequest.of(0, TOP_N))
                .stream().map(RecipeResponse::from).toList();
        }
    }

    // 레시피 랭킹 점수 조회
    public Double getRankingScore(Long recipeId) {
        try {
            return redisTemplate.opsForZSet().score(RANKING_KEY, recipeId.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }

    // 랭킹 초기화 (관리자용)
    public void resetRanking() {
        try {
            redisTemplate.delete(RANKING_KEY);
        } catch (Exception e) {
            log.warn("랭킹 초기화 실패: {}", e.getMessage());
        }
    }
}
