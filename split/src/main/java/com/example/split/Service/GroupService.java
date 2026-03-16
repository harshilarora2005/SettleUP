package com.example.split.Service;

import com.example.split.DTOs.GroupRequest;
import com.example.split.Entities.Group;
import com.example.split.Entities.User;
import com.example.split.exception.ResourceNotFoundException;
import com.example.split.Repository.GroupRepository;
import com.example.split.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public Group createGroup(GroupRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Set<User> members = new HashSet<>();
        members.add(creator);
        for (Long memberId : request.getMemberIds()) {
            members.add(userRepository.findById(memberId)
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId)));
        }
        return groupRepository.save(Group.builder()
                .name(request.getName()).createdBy(creator).members(members).build());
    }

    public Group getGroupById(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + id));
    }

    public List<Group> getGroupsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return groupRepository.findByMembersContaining(user);
    }

    public Group addMember(Long groupId, Long userId) {
        Group group = getGroupById(groupId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        group.getMembers().add(user);
        return groupRepository.save(group);
    }

    public void leaveGroup(Long groupId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Group group = getGroupById(groupId);
        group.getMembers().remove(user);
        groupRepository.save(group);
    }

    public void deleteGroup(Long groupId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Group group = getGroupById(groupId);
        if (!group.getCreatedBy().getEmail().equals(email)) {
            throw new org.springframework.security.access.AccessDeniedException("Only the group creator can delete this group");
        }
        groupRepository.delete(group);
    }
}