package com.elkay.taskstream.auth.repository;

import com.elkay.taskstream.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query(value = "SELECT * FROM users u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))", nativeQuery = true)
    List<User> searchUsersByName(@Param("name") String name);
}
