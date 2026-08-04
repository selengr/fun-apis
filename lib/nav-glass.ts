/**
 * Apple-style glass — apply to existing nav bars only.
 * Do not change size/layout; only these surface styles.
 */
export const NAV_GLASS = {
  backdropFilter: 'saturate(180%) blur(8px)',
  WebkitBackdropFilter: 'saturate(180%) blur(8px)',
  background: 'transparent',
  boxShadow: 'inset 0 -1px 0 0 rgba(0,0,0,.1)',
} as const

/** Tailwind/class companion for dark-mode hairline (see globals.css `.nav-glass`). */
export const NAV_GLASS_CLASS = 'nav-glass'
