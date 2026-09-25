package com.smartattend.dto;

import lombok.Data;

import java.util.List;

@Data
public class FaceEncodingRequest {
    private List<String> encodings;
}
