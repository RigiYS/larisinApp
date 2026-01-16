const theme = {
  colors: {
    // Primary colors
    primary: '#6C63FF',      // Modern purple
    primaryLight: '#F0ECFF', // Light purple
    primaryDark: '#5B4BFF',  // Dark purple
    
    // Secondary colors
    secondary: '#FF6B9D',    // Modern pink
    secondaryLight: '#FFE5F0', // Light pink
    
    // Accent colors
    accent: '#6C63FF',       // Teal/green
    warmAccent: '#FF9F43',   // Warm orange
    
    // Backgrounds
    background: '#F8F9FA',   // Very light gray
    surface: '#FFFFFF',      // White
    card: '#FFFFFF',         // White for cards
    
    // Text colors
    text: '#1A1A2E',         // Dark text
    textSecondary: '#6B7280', // Medium gray
    textMuted: '#9CA3AF',    // Light gray
    muted: '#9CA3AF',        // Alias for textMuted
    placeholder: '#D1D5DB',  // Placeholder
    
    // Semantic colors
    success: '#10B981',      // Green
    danger: '#EF4444',       // Red
    warning: '#F59E0B',      // Amber
    info: '#3B82F6',         // Blue
    
    // UI elements
    border: '#E5E7EB',       // Light border
    divider: '#F3F4F6',      // Divider
    inputBackground: '#F9FAFB', // Input background
    
    // Special
    icon: '#818181',         // Icon color
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.6)'
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  
  fonts: {
    light: 300 as const,
    regular: 400 as const,
    medium: 500 as const,
    semibold: 600 as const,
    bold: 700 as const,
  }
};

export default theme;
