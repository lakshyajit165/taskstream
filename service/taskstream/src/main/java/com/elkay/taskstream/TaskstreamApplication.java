package com.elkay.taskstream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TaskstreamApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskstreamApplication.class, args);
	}

}
