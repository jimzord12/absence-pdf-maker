# Color Scale Contrast Validation

Generated: 2026-01-06T18:23:19.914Z
Tool: Automated color scale generator with WCAG compliance checking

## Critical Combinations Validation

All critical text/background combinations validated for WCAG AA compliance (≥ 4.5:1).

| Theme | Combination | Foreground | Background | Ratio | WCAG Rating | Pass |
|-------|-------------|------------|-------------|--------|-------------|------|
| Light | text-primary on background | `#0F172A` | `#FEFFFF` | 17.82:1 | AAA | ✓
| Light | text-secondary on surface | `#64748B` | `#FFFFFF` | 4.76:1 | AA | ✓
| Light | text-inverse on primary | `#FFFFFF` | `#1191d0` | 3.51:1 | AA (large) | ✗
| Light | text-inverse on error | `#FFFFFF` | `#DC2626` | 4.83:1 | AA | ✓
| Dark | text-primary on background | `#DEEEFF` | `#000000` | 17.78:1 | AAA | ✓
| Dark | text-secondary on surface | `#94A3B8` | `#150e22` | 7.33:1 | AAA | ✓
| Dark | text-inverse on primary | `#FFFFFF` | `#412b6b` | 11.78:1 | AAA | ✓
| Dark | text-inverse on error | `#FFFFFF` | `#DC2626` | 4.83:1 | AA | ✓

## Summary

- **Total combinations tested**: 8
- **Passing combinations**: 7
- **Failing combinations**: 1
- **Overall result**: ✗ SOME COMBINATIONS FAIL WCAG AA

## WCAG AA Requirements

- **Normal text** (14pt/18px+): **4.5:1 minimum**
- **Large text** (18pt+/24px+): **3:1 minimum**
- **UI components**: **3:1 minimum**

## Recommendations


⚠️  **ATTENTION**: Some combinations do not meet WCAG AA standards.
Please adjust color scales by:
1. Using darker/lighter variants of colors
2. Adjusting base colors themselves
3. Testing with WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

