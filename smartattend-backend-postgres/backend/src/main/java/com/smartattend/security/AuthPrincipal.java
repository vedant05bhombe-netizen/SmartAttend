package com.smartattend.security;

public record AuthPrincipal(String id, String email, String orgId, String role) {
}
