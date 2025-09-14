package com.elkay.taskstream.auth.payload;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.io.Serializable;
import java.util.HashMap;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserSuggestion implements Serializable {
    private Long id;
    private String name;
    private HashMap<String, Object> additionalParams;

    public UserSuggestion() {
    }

    public UserSuggestion(Long id, String name, HashMap<String, Object> additionalParams) {
        this.id = id;
        this.name = name;
        this.additionalParams = additionalParams;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public HashMap<String, Object> getAdditionalParams() {
        return additionalParams;
    }

    public void setAdditionalParams(HashMap<String, Object> additionalParams) {
        this.additionalParams = additionalParams;
    }
}
