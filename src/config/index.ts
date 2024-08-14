import {
  BORDER_RADIUS,
  BORDER_WIDTH,
  COLORS,
  LINE_HEIGHT_SIZE,
  SIZE_SPACE,
  TEXT_SIZE,
} from "../constants";

export interface DefaultTheme {
  colors: { [key: string]: string };
  space: {
    size: { [key: string | number]: string | number };
    text: { [key: string | number]: string | number };
    "line-height": { [key: string | number]: string | number };
    rounded: { [key: string | number]: string | number };
    border: { [key: string | number]: string | number };
  };
}

interface Config {
  theme: DefaultTheme;
}

const DEFAULT_THEME: DefaultTheme = {
  colors: {
    dark: "#1a75d2",
    light: "#ffffff",
    primary: "#42A5F5",
    secondary: "#BA68C8",
    danger: "#F87171",
    warning: "#FACC15",
    success: "#4ADE80",
    "primary-light": "#AFD1FC",
    "secondary-light": "#E1BEE7",
    "danger-light": "#F87171",
    "warning-light": "#FACC15",
    "success-light": "#4ADE80",
    "primary-dark": "#D7E8FD",
    "secondary-dark": "#DDD6FE",
    ...COLORS,
  },
  space: {
    size: SIZE_SPACE,
    text: TEXT_SIZE,
    "line-height": LINE_HEIGHT_SIZE,
    rounded: BORDER_RADIUS,
    border: BORDER_WIDTH,
  },
};

export const getThemeConfig = (config: Config): DefaultTheme => {
  try {
    return {
      colors: {
        ...DEFAULT_THEME.colors,
        ...config?.theme?.colors,
      },
      space: {
        size: {
          ...DEFAULT_THEME.space.size,
          ...config?.theme?.space?.size,
        },
        text: {
          ...DEFAULT_THEME.space.text,
          ...config?.theme?.space?.text,
        },
        "line-height": {
          ...DEFAULT_THEME.space["line-height"],
          ...config?.theme?.space?.["line-height"],
        },
        rounded: {
          ...DEFAULT_THEME.space.rounded,
          ...config?.theme?.space?.rounded,
        },
        border: {
          ...DEFAULT_THEME.space.border,
          ...config?.theme?.space?.border,
        },
      },
    };
  } catch (error) {
    return DEFAULT_THEME;
  }
};
