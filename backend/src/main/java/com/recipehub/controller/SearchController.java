package com.recipehub.controller;

import com.recipehub.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    // Trie 자동완성
    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> autocomplete(@RequestParam String prefix) {
        return ResponseEntity.ok(searchService.autocomplete(prefix));
    }

    // 재료명 표준화
    @GetMapping("/standardize")
    public ResponseEntity<String> standardize(@RequestParam String name) {
        return ResponseEntity.ok(searchService.standardize(name));
    }
}
