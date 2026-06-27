// Two of Us — the card library.
// A couples card game: one phone, two people, taking turns drawing prompts.
//
// Each card belongs to a DECK (the vibe) and a LEVEL (how deep / how bold).
// `type` changes the mechanic, `to` says who's on the spot relative to the
// person who drew the card (the "active player"):
//   - 'self'    → the drawer answers / does it
//   - 'partner' → the drawer puts it to their partner
//   - 'both'    → both of you, together
// In card text, {partner} is replaced with the other player's name at runtime.

export type DeckId = 'sweet' | 'deep' | 'memories' | 'spicy';
export type CardType = 'ask' | 'guess' | 'dare';
export type CardTo = 'self' | 'partner' | 'both';
export type Level = 1 | 2 | 3;

export interface Card {
  id: string;
  deck: DeckId;
  level: Level;
  type: CardType;
  to: CardTo;
  text: string;
}

export interface DeckMeta {
  id: DeckId;
  name: string;
  emoji: string;
  blurb: string;
  adult?: boolean;
  // tailwind-ish hex used for the card face gradient + accents
  from: string;
  to: string;
  ink: string; // readable text color on the card face
}

export const DECKS: DeckMeta[] = [
  {
    id: 'sweet',
    name: 'Sweet & Funny',
    emoji: '🍿',
    blurb: 'Easy, playful warm-ups and silly hypotheticals.',
    from: '#FFD56B',
    to: '#FF9F5A',
    ink: '#5a3210',
  },
  {
    id: 'memories',
    name: 'Memories & Us',
    emoji: '📸',
    blurb: 'First impressions, favorite moments, our inside jokes.',
    from: '#FF9A8B',
    to: '#FF6A88',
    ink: '#5c1530',
  },
  {
    id: 'deep',
    name: 'Deep & Personal',
    emoji: '🌙',
    blurb: 'Honest, tender questions that open real conversation.',
    from: '#A18CD1',
    to: '#7B5EA7',
    ink: '#f4eefb',
  },
  {
    id: 'spicy',
    name: 'Spicy',
    emoji: '🔥',
    blurb: 'Flirty to steamy. 18+ only — unlock in Decks.',
    adult: true,
    from: '#FF5F7E',
    to: '#C9184A',
    ink: '#fff0f3',
  },
];

export const DECK_MAP: Record<DeckId, DeckMeta> = DECKS.reduce(
  (m, d) => ((m[d.id] = d), m),
  {} as Record<DeckId, DeckMeta>
);

// ---------------------------------------------------------------------------
// Cards. ids are stable (deck-prefixed) so favorites + seen-history survive.
// ---------------------------------------------------------------------------

// Small helper to keep the data terse but typed.
const c = (
  id: string,
  deck: DeckId,
  level: Level,
  type: CardType,
  to: CardTo,
  text: string
): Card => ({ id, deck, level, type, to, text });

export const CARDS: Card[] = [
  // ===================== SWEET & FUNNY =====================
  c('sw1', 'sweet', 1, 'ask', 'self', 'If you could only eat one meal for the rest of your life, what would it be?'),
  c('sw2', 'sweet', 1, 'ask', 'partner', "Ask {partner}: what's the most useless talent you have?"),
  c('sw3', 'sweet', 1, 'guess', 'partner', "Guess {partner}'s go-to karaoke song. Then make them prove you right (or wrong)."),
  c('sw4', 'sweet', 1, 'ask', 'self', 'What fictional character do you secretly think you are?'),
  c('sw5', 'sweet', 1, 'ask', 'both', 'If we were a famous duo (real or fictional), who would we be?'),
  c('sw6', 'sweet', 1, 'dare', 'self', 'Do your best impression of your partner ordering at a restaurant.'),
  c('sw7', 'sweet', 1, 'ask', 'self', "What's a weird food combo you'll defend to the death?"),
  c('sw8', 'sweet', 1, 'guess', 'partner', "Guess: would {partner} rather fight one horse-sized duck or a hundred duck-sized horses?"),
  c('sw9', 'sweet', 1, 'ask', 'partner', "Ask {partner}: what's the pettiest reason you've ever been annoyed at someone?"),
  c('sw10', 'sweet', 1, 'ask', 'self', 'If our pet (real or imaginary) could talk, what would it say about us?'),
  c('sw11', 'sweet', 2, 'ask', 'self', "What's the most embarrassing thing in your search history right now?"),
  c('sw12', 'sweet', 2, 'dare', 'both', 'Make up a theme song for our relationship and sing the chorus together.'),
  c('sw13', 'sweet', 2, 'ask', 'partner', "Ask {partner}: if you won the lottery tomorrow, what's the first ridiculous thing you'd buy?"),
  c('sw14', 'sweet', 2, 'guess', 'partner', "Guess {partner}'s most-used emoji. Check their phone to settle it."),
  c('sw15', 'sweet', 2, 'ask', 'self', "What's a small thing that makes you irrationally happy?"),
  c('sw16', 'sweet', 2, 'dare', 'self', 'Give your partner a dramatic, over-the-top compliment like a soap opera star.'),
  c('sw17', 'sweet', 2, 'ask', 'both', 'Invent a holiday just for the two of us. What do we celebrate and how?'),
  c('sw18', 'sweet', 2, 'ask', 'self', 'If you had to describe me using only a sound effect, what would it be?'),
  c('sw19', 'sweet', 3, 'ask', 'self', "What's the cringiest thing you've ever done to impress someone you liked?"),
  c('sw20', 'sweet', 3, 'dare', 'both', 'Swap phones and post a story / send a text as each other (nothing mean!).'),
  c('sw21', 'sweet', 3, 'ask', 'partner', "Ask {partner}: what's a hill you'll die on that nobody agrees with you about?"),
  c('sw22', 'sweet', 3, 'ask', 'self', "What's the most unhinged thought you've had this week?"),

  // ===================== MEMORIES & US =====================
  c('me1', 'memories', 1, 'ask', 'self', 'What was your very first impression of me?'),
  c('me2', 'memories', 1, 'ask', 'self', 'What was the moment you realized you actually liked me?'),
  c('me3', 'memories', 1, 'guess', 'partner', "Guess: what does {partner} remember most about our first date?"),
  c('me4', 'memories', 1, 'ask', 'both', "What's our most-quoted inside joke? Say it in unison on three."),
  c('me5', 'memories', 1, 'ask', 'self', "What's a tiny moment with me you think about more than I'd expect?"),
  c('me6', 'memories', 1, 'ask', 'self', 'Which trip or day out together would you relive exactly as it happened?'),
  c('me7', 'memories', 1, 'ask', 'partner', "Ask {partner}: what song instantly reminds you of us?"),
  c('me8', 'memories', 2, 'ask', 'self', 'When did you feel proudest of me?'),
  c('me9', 'memories', 2, 'ask', 'self', "What's something we used to do early on that I miss?"),
  c('me10', 'memories', 2, 'guess', 'partner', "Guess the first gift {partner} ever gave you. Were you right?"),
  c('me11', 'memories', 2, 'ask', 'self', "What's the hardest we've ever laughed together?"),
  c('me12', 'memories', 2, 'ask', 'both', 'What was our first real fight about — and does it seem silly now?'),
  c('me13', 'memories', 2, 'ask', 'self', 'What do you remember about the first time you met my family or friends?'),
  c('me14', 'memories', 2, 'ask', 'self', 'Which version of me — past or now — do you love, and what changed?'),
  c('me15', 'memories', 3, 'ask', 'self', 'When in our relationship did you feel closest to me?'),
  c('me16', 'memories', 3, 'ask', 'self', 'Was there a moment you almost didn\'t say something — and you\'re glad you did?'),
  c('me17', 'memories', 3, 'ask', 'partner', "Ask {partner}: what's a memory of us you'd want to keep if you could keep only one?"),
  c('me18', 'memories', 3, 'ask', 'self', 'What did loving me teach you about yourself?'),
  c('me19', 'memories', 3, 'ask', 'both', 'Tell the story of how we got together — but each of you tells your half.'),
  c('me20', 'memories', 3, 'ask', 'self', "When did you first think 'this might be the one'?"),

  // ===================== DEEP & PERSONAL =====================
  c('de1', 'deep', 1, 'ask', 'self', 'What does a perfect ordinary day look like for you?'),
  c('de2', 'deep', 1, 'ask', 'self', 'What makes you feel most loved — words, time, touch, gifts, or help?'),
  c('de3', 'deep', 1, 'ask', 'partner', "Ask {partner}: what's something you're looking forward to right now?"),
  c('de4', 'deep', 1, 'ask', 'self', 'When do you feel most like yourself?'),
  c('de5', 'deep', 1, 'ask', 'self', "What's a small way I could make your week easier?"),
  c('de6', 'deep', 1, 'ask', 'self', 'Who in your life shaped you the most, and how?'),
  c('de7', 'deep', 2, 'ask', 'self', "What's something you're afraid to want?"),
  c('de8', 'deep', 2, 'ask', 'self', "What's a fear you have about us that you don't say out loud?"),
  c('de9', 'deep', 2, 'ask', 'self', 'When was the last time you cried, and what was it about?'),
  c('de10', 'deep', 2, 'ask', 'partner', "Ask {partner}: what do you need more of from me lately?"),
  c('de11', 'deep', 2, 'ask', 'self', 'What part of yourself are you still learning to accept?'),
  c('de12', 'deep', 2, 'ask', 'self', 'What does "home" mean to you — and do you feel it with me?'),
  c('de13', 'deep', 2, 'ask', 'self', 'What dream have you put on hold, and why?'),
  c('de14', 'deep', 2, 'guess', 'partner', "Guess: what does {partner} think is their best quality? Then ask if you got it."),
  c('de15', 'deep', 3, 'ask', 'self', 'What do you hope our life looks like in five years?'),
  c('de16', 'deep', 3, 'ask', 'self', 'Is there anything you\'ve been wanting to tell me but haven\'t found the moment for?'),
  c('de17', 'deep', 3, 'ask', 'self', 'What does forgiveness look like to you?'),
  c('de18', 'deep', 3, 'ask', 'self', 'What would you want me to know if we only had one more day together?'),
  c('de19', 'deep', 3, 'ask', 'both', 'Each name one thing you want to build together — then find where they overlap.'),
  c('de20', 'deep', 3, 'ask', 'self', 'Where do you most want to grow, and how can I support that?'),

  // ===================== SPICY (18+) =====================
  c('sp1', 'spicy', 1, 'ask', 'self', "What's the most attractive non-physical thing about your partner?"),
  c('sp2', 'spicy', 1, 'ask', 'self', 'What were you thinking the first time you found me attractive?'),
  c('sp3', 'spicy', 1, 'dare', 'self', 'Whisper one thing you find irresistible about your partner in their ear.'),
  c('sp4', 'spicy', 1, 'guess', 'partner', "Guess {partner}'s favorite thing about kissing you."),
  c('sp5', 'spicy', 1, 'ask', 'partner', "Ask {partner}: what outfit of mine do you like me out of the most... I mean, in?"),
  c('sp6', 'spicy', 1, 'dare', 'self', 'Hold eye contact with your partner for 30 seconds. No giggling.'),
  c('sp7', 'spicy', 2, 'ask', 'self', "What's something you've wanted to try but haven't brought up?"),
  c('sp8', 'spicy', 2, 'dare', 'self', 'Give your partner a 20-second shoulder or neck massage.'),
  c('sp9', 'spicy', 2, 'ask', 'self', 'What was the moment today you most wanted to kiss me?'),
  c('sp10', 'spicy', 2, 'ask', 'partner', "Ask {partner}: where's your favorite place to be touched that isn't obvious?"),
  c('sp11', 'spicy', 2, 'guess', 'partner', "Guess the spot that drives {partner} wild. One guess — then find out."),
  c('sp12', 'spicy', 2, 'dare', 'self', 'Describe your ideal date night that ends... however you want it to.'),
  c('sp13', 'spicy', 2, 'ask', 'self', "What's a fantasy you'd feel safe sharing with me right now?"),
  c('sp14', 'spicy', 3, 'dare', 'both', 'Set a 2-minute timer. Make out like it\'s the first time.'),
  c('sp15', 'spicy', 3, 'ask', 'self', 'What do you want more of from me in the bedroom?'),
  c('sp16', 'spicy', 3, 'dare', 'self', 'Send your partner a text right now of what you want to do to them later.'),
  c('sp17', 'spicy', 3, 'ask', 'partner', "Ask {partner}: what's something that turns you on that I'd never guess?"),
  c('sp18', 'spicy', 3, 'dare', 'both', 'Take turns: each undo one button / clasp on the other. Slowly.'),
  c('sp19', 'spicy', 3, 'ask', 'self', 'What would your perfect uninterrupted night with me look like, start to finish?'),
];

export function deckCounts(): Record<DeckId, number> {
  const out = { sweet: 0, memories: 0, deep: 0, spicy: 0 } as Record<DeckId, number>;
  for (const card of CARDS) out[card.deck]++;
  return out;
}
