export const POS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  noun:      { bg: 'bg-blue-50  dark:bg-blue-950',    text: 'text-blue-800  dark:text-blue-200',   border: 'border-blue-200  dark:border-blue-800',   dot: 'bg-blue-500'   },
  verb:      { bg: 'bg-teal-50  dark:bg-teal-950',    text: 'text-teal-800  dark:text-teal-200',   border: 'border-teal-200  dark:border-teal-800',   dot: 'bg-teal-500'   },
  adjective: { bg: 'bg-amber-50 dark:bg-amber-950',   text: 'text-amber-800 dark:text-amber-200',  border: 'border-amber-200 dark:border-amber-800',  dot: 'bg-amber-500'  },
  adverb:    { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
}

export const getPos = (pos: string) =>
  POS_STYLES[pos] ?? {
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-700',
    dot: 'bg-zinc-400',
  }

export const POS_ICON: Record<string, string> = {
  noun: 'N', verb: 'V', adjective: 'Adj', adverb: 'Adv',
  pronoun: 'Pro', preposition: 'Prep', conjunction: 'Conj',
}