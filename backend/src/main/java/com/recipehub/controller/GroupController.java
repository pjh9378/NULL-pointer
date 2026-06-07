package com.recipehub.controller;

import com.recipehub.dto.group.*;
import com.recipehub.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    // 그룹 생성
    @PostMapping
    public ResponseEntity<GroupResponse> create(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody GroupCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(groupService.createGroup(email, request));
    }

    // 내 그룹 목록
    @GetMapping("/my")
    public ResponseEntity<List<GroupResponse>> getMyGroups(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(groupService.getMyGroups(email));
    }

    // 그룹 상세
    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponse> getGroup(
            @AuthenticationPrincipal String email,
            @PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroup(email, groupId));
    }

    // 멤버 초대
    @PostMapping("/{groupId}/invite")
    public ResponseEntity<Void> invite(
            @AuthenticationPrincipal String email,
            @PathVariable Long groupId,
            @Valid @RequestBody InviteRequest request) {
        groupService.invite(email, groupId, request.getEmail());
        return ResponseEntity.ok().build();
    }

    // 초대 수락/거절
    @PostMapping("/invites/{memberId}/respond")
    public ResponseEntity<Void> respond(
            @AuthenticationPrincipal String email,
            @PathVariable Long memberId,
            @RequestParam boolean accept) {
        groupService.respondInvite(email, memberId, accept);
        return ResponseEntity.ok().build();
    }

    // 대기 중인 초대 목록
    @GetMapping("/invites/pending")
    public ResponseEntity<List<InviteResponse>> getPendingInvites(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(groupService.getPendingInvites(email));
    }

    // 그룹 멤버 목록
    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<MemberResponse>> getMembers(
            @AuthenticationPrincipal String email,
            @PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getMembers(email, groupId));
    }

    // 멤버 내보내기
    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @AuthenticationPrincipal String email,
            @PathVariable Long groupId,
            @PathVariable Long memberId) {
        groupService.removeMember(email, groupId, memberId);
        return ResponseEntity.noContent().build();
    }
}
