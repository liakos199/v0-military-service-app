# Color Schemes for Military Service App

## Previous Color Scheme (Original)
**Theme:** Tactical Slate & Olive with Cyan/Gold Accents

| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Background | Tactical Black | #0a0a0b | Main background |
| Foreground | Light Gray | #f1f1f1 | Text color |
| Card | Dark Slate | #1c1c1f | Card backgrounds |
| Primary | Cyan | #06b6d4 | Primary actions |
| Secondary | Dark Gray | #252529 | Secondary elements |
| Accent | Cyan | #06b6d4 | Highlights |
| Destructive | Red | #ff453a | Danger actions |
| Sidebar Primary | Gold | #eab308 | Sidebar highlights |
| Chart 1 | Gold | #eab308 | Data visualization |
| Chart 2 | Dark Gold | #ca8a04 | Data visualization |

---

## New Refined Color Scheme (Current)
**Theme:** Military Professional with Enhanced Contrast & Accessibility

### Core Colors
| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Background | Deep Navy | #0f1419 | Main background - improved depth |
| Foreground | Bright White | #ffffff | Primary text - better contrast |
| Card | Navy Slate | #1a202c | Card backgrounds - better definition |
| Popover | Deep Navy | #0f1419 | Popover backgrounds |

### Primary & Secondary
| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Primary | Military Blue | #0ea5e9 | Primary actions - more professional |
| Primary Foreground | Navy | #001f3f | Text on primary |
| Secondary | Slate Gray | #334155 | Secondary elements |
| Secondary Foreground | Light Gray | #e2e8f0 | Text on secondary |

### Accent & Status
| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Accent | Emerald Green | #10b981 | Success/active states |
| Accent Foreground | White | #ffffff | Text on accent |
| Muted | Slate | #475569 | Muted elements |
| Muted Foreground | Light Slate | #cbd5e1 | Muted text |
| Destructive | Red | #ef4444 | Error/danger states |
| Destructive Foreground | White | #ffffff | Text on destructive |

### Interactive Elements
| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Border | Slate with opacity | rgba(148, 163, 184, 0.2) | Subtle borders |
| Input | Slate | #1e293b | Input fields |
| Ring | Military Blue | #0ea5e9 | Focus ring |

### Chart Colors
| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Chart 1 | Emerald | #10b981 | Primary data series |
| Chart 2 | Military Blue | #0ea5e9 | Secondary data series |
| Chart 3 | Slate | #64748b | Tertiary data series |
| Chart 4 | Amber | #f59e0b | Quaternary data series |
| Chart 5 | Rose | #f43f5e | Quinary data series |

### Sidebar & Glass Effects
| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Sidebar | Deep Navy | #0f1419 | Sidebar background |
| Sidebar Foreground | White | #f8fafc | Sidebar text |
| Sidebar Primary | Military Blue | #0ea5e9 | Sidebar highlights |
| Sidebar Primary Foreground | Navy | #001f3f | Text on sidebar primary |
| Sidebar Accent | Slate | #334155 | Sidebar accents |
| Sidebar Accent Foreground | White | #f8fafc | Text on sidebar accent |
| Glass | Navy with opacity | rgba(15, 20, 25, 0.8) | Glass morphism |
| Glass Border | Slate with opacity | rgba(148, 163, 184, 0.15) | Glass border |
| Glass Highlight | Military Blue | #0ea5e9 | Glass highlights |

---

## Design Rationale

### Improvements Made:
1. **Enhanced Contrast**: Upgraded from cyan (#06b6d4) to military blue (#0ea5e9) for better readability
2. **Professional Palette**: Shifted from gold accents to emerald green and blue for military/professional aesthetic
3. **WCAG Compliance**: Improved contrast ratios for accessibility standards
4. **Consistent Hierarchy**: Better visual hierarchy with refined secondary colors
5. **Modern Aesthetics**: Updated to contemporary design trends while maintaining military professionalism
6. **Better Data Visualization**: More distinct chart colors for improved data readability

### Color Psychology:
- **Military Blue (#0ea5e9)**: Trust, stability, professionalism
- **Emerald Green (#10b981)**: Growth, success, positive actions
- **Deep Navy (#0f1419)**: Authority, sophistication, depth
- **Slate Grays**: Balance, neutrality, professionalism

---

## Revert Instructions

To revert to the original color scheme, run:
```bash
cp app/globals.css.bak app/globals.css
```

Then commit and push the changes to restore the previous design.
