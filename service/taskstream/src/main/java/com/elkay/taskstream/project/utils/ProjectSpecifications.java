package com.elkay.taskstream.project.utils;

import com.elkay.taskstream.project.model.Project;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Instant;
import java.util.List;

public class ProjectSpecifications {
    
    public static Specification<Project> filter(
            String searchText,
            Instant dueDateRangeStart,
            Instant dueDateRangeEnd,
            Instant createdAtRangeStart,
            Instant createdAtRangeEnd,
            List<String> tags
    ) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (searchText != null && !searchText.isEmpty()) {
                String like = "%" + searchText.toLowerCase() + "%";
                predicate = cb.and(predicate, cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("description")), like)
                ));
            }

            if (tags != null && !tags.isEmpty()) {
                // convert input tag list to lowercase
                List<String> lowerTags = tags.stream()
                        .map(String::toLowerCase)
                        .toList();

                predicate = cb.and(predicate,
                        cb.lower(root.join("tags").get("name")).in(lowerTags)
                );
            }

            if (dueDateRangeStart != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("dueDate"), dueDateRangeStart));
            }

            if (dueDateRangeEnd != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("dueDate"), dueDateRangeEnd));
            }

            if (createdAtRangeStart != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("createdAt"), createdAtRangeStart));
            }

            if (createdAtRangeEnd != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("createdAt"), createdAtRangeEnd));
            }

            return predicate;
        };
    }
}
