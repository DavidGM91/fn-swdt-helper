package com.example.fnsdthelper.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.List;

@RestController
public class BotController {

    private List<Bot> bots = new ArrayList<>();

    @PostMapping("/submit")
    public String submit(@RequestParam String modelName, @RequestParam int quality) {
        bots.add(new Bot(modelName, quality));
        return "success";
    }

    // Placeholder for providing advice
    @PostMapping("/advice")
    public String provideAdvice() {
        return "Check your bots and consider upgrading low-quality ones.";
    }
}