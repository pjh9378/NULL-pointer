package com.recipehub.domain.group;

import com.recipehub.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"group_id", "user_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private RecipeGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupRole role;

    // 초대 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InviteStatus inviteStatus = InviteStatus.PENDING;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime joinedAt;

    @Builder
    public GroupMember(RecipeGroup group, User user, GroupRole role, InviteStatus inviteStatus) {
        this.group = group;
        this.user = user;
        this.role = role;
        this.inviteStatus = inviteStatus;
    }

    public void accept() {
        this.inviteStatus = InviteStatus.ACCEPTED;
    }

    public void reject() {
        this.inviteStatus = InviteStatus.REJECTED;
    }
}
