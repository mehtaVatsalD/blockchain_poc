package com.blogflog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BlockchainPocApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlockchainPocApplication.class, args);
	}

}
