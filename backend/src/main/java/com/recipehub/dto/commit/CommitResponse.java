package com.recipehub.dto.commit;

import com.recipehub.domain.commit.Commit;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class CommitResponse {
    private Long id;
    private String message;
    private String authorUsername;
    private String snapshot;
    private LocalDateTime createdAt;

    public static CommitResponse from(Commit commit) {
        return CommitResponse.builder()
            .id(commit.getId())
            .message(commit.getMessage())
            .authorUsername(commit.getAuthor().getUsername())
            .snapshot(commit.getSnapshot())
            .createdAt(commit.getCreatedAt())
            .build();
    }
}
