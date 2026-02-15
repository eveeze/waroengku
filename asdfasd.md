Design Review Results: Warungku Mobile App (All Routes)
Review Date: February 4, 2026
Routes Reviewed: All admin and auth routes
Focus Areas: Visual Design, UX/Usability, Responsive/Mobile, Accessibility, Micro-interactions/Motion, Consistency, Performance

Note: This review was conducted through static code analysis only. Visual inspection via browser would provide additional insights into layout rendering, interactive behaviors, and actual appearance.

Summary
The Warungku app demonstrates a strong Swiss Minimalist design language with excellent typography choices (Plus Jakarta Sans + Space Grotesk) and a well-structured theme system using CSS variables. However, there are several critical accessibility issues, inconsistent component patterns across screens, and opportunities for better UX and performance optimization.

Issues

# Issue Criticality Category Location

1 Login page uses hardcoded bg-white instead of bg-background, breaking dark mode support 🔴 Critical Consistency mobile/app/(auth)/login.tsx:59
2 Multiple text elements use text-secondary-400 which is not defined in tailwind config 🔴 Critical Visual Design mobile/app/(auth)/login.tsx:80,138,159,177
3 Low color contrast on muted-foreground text against muted backgrounds (potentially below 4.5:1) 🔴 Critical Accessibility mobile/global.css:17-18, multiple components
4 Missing accessible labels on icon-only buttons (logout arrow, barcode scanner, filter toggle) 🔴 Critical Accessibility mobile/app/(admin)/index.tsx:101-106, mobile/app/(admin)/pos/index.tsx:314-319
5 warning color class used but not defined in tailwind.config.js 🟠 High Visual Design mobile/app/(admin)/index.tsx:174-175
6 BottomTabBar uses hardcoded color strings instead of theme variables 🟠 High Consistency mobile/src/components/navigation/BottomTabBar.tsx:144-148
7 Inconsistent border-radius usage: some elements use rounded-none, others use rounded-lg/xl/2xl/3xl 🟠 High Consistency Multiple files
8 No loading skeleton placeholders - app shows blank states during data fetching 🟠 High UX/Usability mobile/app/(admin)/index.tsx:73-289
9 Missing focus indicators for keyboard/screen reader navigation 🟠 High Accessibility All interactive elements across the app
10 TouchableOpacity components don't specify hitSlop for small touch targets 🟠 High Responsive/Mobile mobile/app/(admin)/index.tsx:118-120, mobile/app/(admin)/pos/index.tsx:231-244
11 POS product grid quantity buttons (28x28px) are below 44x44px minimum touch target 🟠 High Accessibility mobile/app/(admin)/pos/index.tsx:231-244
12 Alert.prompt used for "Hold Cart" - not supported on Android 🟠 High Responsive/Mobile mobile/app/(admin)/pos/index.tsx:155-179
13 RefreshControl uses hardcoded tintColor="#000" instead of theme color 🟡 Medium Consistency mobile/app/(admin)/reports/index.tsx:97-98, mobile/app/(admin)/transactions/index.tsx:339
14 No empty state illustrations - only text-based empty states 🟡 Medium UX/Usability Multiple list screens
15 Duplicated formatCurrency utility function across 10+ screen files 🟡 Medium Consistency All screen files
16 Login button label "AUTHENTICATE" is not user-friendly; should be "LOG IN" or "SIGN IN" 🟡 Medium UX/Usability mobile/app/(auth)/login.tsx:152
17 Filter button in Products/Transactions screens uses single letter "F" instead of icon 🟡 Medium Visual Design mobile/app/(admin)/products/index.tsx:365-369
18 Font families in tailwind config reference specific font weights that may not load 🟡 Medium Performance mobile/tailwind.config.js:39-43
19 No transition/animation on category tab selection in POS screen 🟡 Medium Micro-interactions mobile/app/(admin)/pos/index.tsx:337-356
20 Back button across screens uses inconsistent patterns (sometimes "← Back" text, sometimes just arrow) 🟡 Medium Consistency Multiple header sections
21 Dark mode status bar styling not properly configured 🟡 Medium Visual Design mobile/app/(admin)/index.tsx:75
22 ProductCard in POS has opacity-0 class that never transitions to visible ⚪ Low Micro-interactions mobile/app/(admin)/pos/index.tsx:247-249
23 Menu items use emoji icons instead of consistent icon library ⚪ Low Visual Design mobile/app/(admin)/menu.tsx:18-73
24 useEffect dependencies array is empty for useFocusEffect callbacks ⚪ Low Performance mobile/app/(admin)/cash-flow/index.tsx:40-44
25 Inventory screen card colors (bg-blue-50, bg-orange-50) break the monochrome Swiss design ⚪ Low Consistency mobile/app/(admin)/inventory/index.tsx:23-45
26 No pull-to-refresh indicator customization for dark mode ⚪ Low Visual Design Multiple ScrollView components
27 Input component has mb-5 hardcoded, limiting layout flexibility ⚪ Low Consistency mobile/src/components/ui/Input.tsx:30
28 Card component uses rounded-none which conflicts with rounded borders elsewhere ⚪ Low Consistency mobile/src/components/ui/Card.tsx:33
29 Missing haptic feedback on key actions (add to cart, checkout) ⚪ Low Micro-interactions mobile/app/(admin)/pos/index.tsx
30 No optimistic UI updates for cart operations ⚪ Low Performance mobile/app/(admin)/pos/index.tsx
Criticality Legend
🔴 Critical: Breaks functionality or violates accessibility standards
🟠 High: Significantly impacts user experience or design quality
🟡 Medium: Noticeable issue that should be addressed
⚪ Low: Nice-to-have improvement
Detailed Analysis by Category
Visual Design
Strengths:

Excellent typography hierarchy with Space Grotesk for headings and Plus Jakarta Sans for body
Strong Swiss Minimalist aesthetic with bold uppercase headings and tight letter-spacing
Good use of CSS variables for theming with light/dark mode support
Issues:

Inconsistent color usage (text-secondary-400 not defined, warning color missing)
Mixed border-radius strategy creates visual inconsistency
Emoji icons break the minimalist aesthetic in some areas
UX/Usability
Strengths:

Clear information hierarchy on dashboard with hero metrics
Intuitive POS flow with inline quantity controls
Good use of alert chips for stock warnings
Issues:

No skeleton loading states cause jarring blank moments
"AUTHENTICATE" button copy is not user-friendly
Alert.prompt for hold cart doesn't work on Android
Accessibility
Strengths:

Good semantic structure with View/Text components
Theme supports dark mode (though incomplete)
Critical Issues:

Several text/background combinations may fail WCAG AA contrast requirements
Icon-only buttons lack accessible labels
Touch targets below 44x44px minimum
No visible focus indicators
Micro-interactions/Motion
Strengths:

Pressable button has scale animation on press
BottomTabBar has smooth active state indication
Issues:

No transition animations on tab/category changes
Missing haptic feedback on key actions
Dead code with opacity-0 that never animates
Consistency
Strengths:

Consistent header pattern across admin screens
Unified card styling in most areas
Shared Button/Input/Card UI components
Issues:

formatCurrency duplicated across 10+ files (should be in utils)
Back button patterns vary between screens
RefreshControl colors hardcoded in some places
Mixed usage of theme colors vs hardcoded values
Performance
Strengths:

Good use of useInfiniteQuery for paginated lists
FlatList used correctly for long lists
React Query caching strategy in place
Issues:

Font family configuration may cause font loading issues
No image optimization/caching strategy visible
useFocusEffect with empty deps array may cause unnecessary refetches
Next Steps
Priority 1 (Critical - Fix Immediately)
Add warning and secondary-400 colors to tailwind.config.js
Replace bg-white with bg-background in login.tsx
Add accessibilityLabel to all icon-only TouchableOpacity components
Increase touch target sizes to minimum 44x44px
Priority 2 (High - Fix This Sprint)
Extract formatCurrency to a shared utility function
Create a consistent Header component to replace duplicated header code
Add skeleton loading components for data-fetching screens
Replace Alert.prompt with a custom modal for Android support
Add focus indicators for accessibility
Priority 3 (Medium - Plan for Next Sprint)
Standardize border-radius usage (recommend consistent use of design tokens)
Add transition animations to tab/category changes
Replace emoji icons with proper icon library (Feather is already installed)
Improve dark mode support across all screens
Priority 4 (Low - Backlog)
Add haptic feedback to key actions
Implement skeleton loading states
Add optimistic UI updates for cart
Create proper empty state illustrations
Component Extraction Recommendations
To improve consistency and reduce duplication, consider extracting these components:

Component Current Pattern Suggested Location
HeroMetric Inline in dashboard src/components/dashboard/HeroMetric.tsx
AlertTicker Inline horizontal ScrollView src/components/dashboard/AlertTicker.tsx
ActionCard Repeated TouchableOpacity pattern src/components/dashboard/ActionCard.tsx
ProductCard Complex inline rendering src/components/pos/ProductCard.tsx
CategoryTabs Inline FlatList src/components/shared/CategoryTabs.tsx
CartSummary Floating bottom bar src/components/pos/CartSummary.tsx
PageHeader Repeated header pattern src/components/shared/PageHeader.tsx
MenuItem Repeated in menu.tsx src/components/menu/MenuItem.tsx
Theme Improvements
Add these missing colors to tailwind.config.js:

// In theme.extend.colors:
warning: {
DEFAULT: 'hsl(var(--warning))',
foreground: 'hsl(var(--warning-foreground))',
},
success: {
DEFAULT: 'hsl(var(--success))',
foreground: 'hsl(var(--success-foreground))',
},
Add to global.css:

:root {
--warning: 38 92% 50%; /_ Amber/Orange _/
--warning-foreground: 0 0% 100%;
--success: 142 76% 36%; /_ Green _/
--success-foreground: 0 0% 100%;
}

.dark {
--warning: 38 92% 50%;
--warning-foreground: 0 0% 0%;
--success: 142 70% 45%;
--success-foreground: 0 0% 0%;
}
Utility Extraction
Create src/utils/formatters.ts:

export const formatCurrency = (amount: number): string => {
return new Intl.NumberFormat('id-ID', {
style: 'currency',
currency: 'IDR',
minimumFractionDigits: 0,
}).format(amount);
};

export const formatDate = (dateString: string): string => {
return new Date(dateString).toLocaleDateString('id-ID', {
day: 'numeric',
month: 'short',
year: 'numeric',
});
};

export const formatTime = (dateString: string): string => {
return new Date(dateString).toLocaleTimeString('id-ID', {
hour: '2-digit',
minute: '2-digit',
hour12: false,
});
};
Review conducted by Kombai on February 4, 2026
