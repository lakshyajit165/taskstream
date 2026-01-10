package com.elkay.taskstream.auth.utils;

import java.util.Random;

import static org.hibernate.annotations.UuidGenerator.Style.RANDOM;

public class VerificationCode {
    public static String generateSixDigitCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Range: 100000 to 999999
        return String.valueOf(code);
    }
}
