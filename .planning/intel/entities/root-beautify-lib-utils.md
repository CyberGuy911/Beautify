---
path: /root/Beautify/lib/utils.ts
type: util
updated: 2026-01-21
status: active
---

# utils.ts

## Purpose

Provides a utility function for conditionally merging Tailwind CSS classes. Combines clsx for conditional class logic with tailwind-merge to properly handle conflicting Tailwind utility classes.

## Exports

- `cn(...inputs: ClassValue[])` - Merges class names using clsx and resolves Tailwind conflicts via twMerge

## Dependencies

- `clsx` - External library for constructing className strings conditionally
- `tailwind-merge` - External library for merging Tailwind CSS classes without conflicts

## Used By

TBD