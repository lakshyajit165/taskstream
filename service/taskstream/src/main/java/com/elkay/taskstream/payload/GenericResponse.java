package com.elkay.taskstream.payload;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.io.Serializable;

@JsonInclude(JsonInclude.Include.NON_NULL) // this will omit null fields
public class GenericResponse<T> implements Serializable{

    private String message;
    private boolean error;
    private T data;

    public GenericResponse() {
    }

    public GenericResponse(String message, boolean error) {
        this.message = message;
        this.error = error;
    }

    public GenericResponse(String message, boolean error, T data) {
        this.message = message;
        this.error = error;
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isError() {
        return error;
    }

    public void setError(boolean error) {
        this.error = error;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
