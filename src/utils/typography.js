import Typography from "typography"
import grandViewTheme from "typography-theme-grand-view"

grandViewTheme.overrideThemeStyles = () => {
  return {
    "a.gatsby-resp-image-link": {
      boxShadow: `none`,
    },
    ".gatsby-resp-image-wrapper": {
      width: '100%',
      maxWidth: '100%!important',
    },
  }
}

const typography = new Typography(grandViewTheme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
