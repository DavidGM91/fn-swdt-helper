package com.example.fnsdthelper.model;

public class Bot {
    private String modelName;
    private int quality;

    public Bot(String modelName, int quality) {
        this.modelName = modelName;
        this.quality = quality;
    }

    // Getters and setters
    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public int getQuality() {
        return quality;
    }

    public void setQuality(int quality) {
        this.quality = quality;
    }
}