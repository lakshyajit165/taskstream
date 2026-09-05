package com.elkay.taskstream.auth.model;

import com.elkay.taskstream.auth.oauth.OAuthProvider;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name="users")
@EntityListeners(AuditingEntityListener.class)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique=true, nullable=false)
    private String email;

    // password is nullable after the oauth impl
    private String password;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name="user_roles",
            joinColumns=@JoinColumn(name="user_id"),
            inverseJoinColumns=@JoinColumn(name="role_id")
    )
    private Set<Role> roles = new HashSet<>();


    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany( mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true )
    private Set<OAuthIdentity> oauthIdentities = new HashSet<>();

    public User() {}
    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public void addRole(Role role) { this.roles.add(role); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }


    public Set<OAuthIdentity> getOauthIdentities() {
        return oauthIdentities;
    }

    public void setOauthIdentities(Set<OAuthIdentity> oauthIdentities) {
        this.oauthIdentities = oauthIdentities;
    }

    public void addOAuthIdentity(OAuthIdentity oauthIdentity) {
        oauthIdentities.add(oauthIdentity); oauthIdentity.setUser(this);
    }

    public void removeOAuthIdentity(OAuthIdentity oauthIdentity) {
        oauthIdentities.remove(oauthIdentity);
        oauthIdentity.setUser(null);
    }
}
