/* ============================================================================
   THE WARRIORS PROJECT — Workbook Data
   The Call to the Warrior's Path + the 14-module journey.
   Module 0 is rendered in full from the approved Final Draft.
   Modules 1–14 are scaffolded skeletons (titles, core ideas, anchor
   scriptures, and the seven-part rhythm) ready to be filled in.
   ----------------------------------------------------------------------------
   Source note: the master workbook draft duplicates Modules 7 & 10 and does
   not yet contain distinct copy for Modules 8 & 11 — those two stations are
   flagged below as `placeholder: true` so they read as "outline pending."
============================================================================ */

/* The six pillars that frame the whole journey. */
const PILLARS = {
  identity:       { n: "01", key: "identity",       name: "Identity",       blurb: "Who you are in Christ." },
  purpose:        { n: "02", key: "purpose",        name: "Purpose",        blurb: "Why you were created." },
  formation:      { n: "03", key: "formation",      name: "Formation",      blurb: "How God shapes you." },
  warfare:        { n: "04", key: "warfare",        name: "Warfare",        blurb: "How you fight and win." },
  sanctification: { n: "05", key: "sanctification", name: "Sanctification", blurb: "How you grow day by day." },
  hope:           { n: "06", key: "hope",           name: "Hope",           blurb: "Where all of this is headed." },
};

/* The seven-part rhythm every module follows. */
const RHYTHM = [
  { n: "01", name: "Teaching",            desc: "Clear, biblical, and direct. No fluff." },
  { n: "02", name: "Illustration",        desc: "A picture to help truth sink from your head into your chest." },
  { n: "03", name: "Reflection Questions",desc: "Not meant to be rushed. They expose the heart and reveal where God is working." },
  { n: "04", name: "Tactical Exercises",  desc: "Practical, immediate steps that turn belief into behavior." },
  { n: "05", name: "Journal Space",       desc: "Be honest. Be raw. Write what you normally hide. God meets you in transparency." },
  { n: "06", name: "The Warrior's Creed", desc: "A one-line anchor — your declaration for the day." },
  { n: "07", name: "Prayer",              desc: "Words that shape your spirit and root your identity. Pray each one aloud." },
];

/* ---------------------------------------------------------------------------
   MODULE 0 — full welcome content (from the approved Final Draft)
--------------------------------------------------------------------------- */
const MODULE_0 = {
  letter: {
    eyebrow: "I · A Letter from Robert",
    title: "A Letter from Robert",
    body: [
      "If you're holding this, something brought you here. Maybe you were handed it. Maybe you searched for it. Maybe you don't even know why you opened the first page.",
      "That's enough. You're in the right place.",
      "My name is Robert Lindenberg. I started The Warriors Project because I lived the questions most men are too tired to ask out loud.",
      "Why am I like this? When does it stop? What's the point?",
      "God didn't wait for me to clean up. He met me in the middle of the mess and built me from there.",
      "That's what this workbook is. Not theory. Not Sunday talk. A 14-day forging written for the broken, the lost, and the hurting.",
      "If that's you, you're not disqualified. You're a warrior with kinked-up armor and breath still in your lungs. The fight isn't finished yet. Let's walk.",
    ],
    signoff: "— Robert Lindenberg",
    role: "Founder, The Warriors Project",
  },
  forYou: {
    eyebrow: "II · This Is for You",
    title: "This Is for You",
    lines: [
      "For the one whose life didn't go the way they planned.",
      "For the one who did everything right and it still fell apart.",
      "For the one carrying things nobody else knows about.",
      "For the one surrounded by people and still completely alone.",
      "For the one tired of fighting battles nobody else sees.",
    ],
    close: "This is for you.",
  },
  welcome: {
    eyebrow: "III · Welcome",
    title: "You Were Summoned to This",
    intro: "You didn't stumble into this workbook. You were summoned to it. Every warrior in Scripture had a moment when God interrupted their normal and called them into something higher. Not one of them felt ready.",
    summoned: [
      { who: "Moses",  where: "at the burning bush — a fugitive and a stutterer" },
      { who: "Gideon", where: "in the winepress — hiding from the enemy" },
      { who: "David",  where: "in the fields — forgotten by his own father" },
      { who: "Peter",  where: "at the shoreline — a fisherman who'd never led anything" },
      { who: "Paul",   where: "on the Damascus road — heading the wrong direction entirely" },
      { who: "The thief on the cross", where: "nothing to offer, everything against him" },
    ],
    transform: "None were qualified. All were chosen. So are you. This is your moment. Not a moment of hype — a moment of alignment. You're stepping into a journey that will sharpen you, confront you, strengthen you, and call out the warrior God placed inside you long before you ever knew Him.",
  },
  pillars: {
    eyebrow: "V · The Architecture",
    title: "The Six Pillars",
    intro: "These 14 modules form a clear path through six pillars — a two-week personal revival, a spiritual recalibration, a discipleship bootcamp, a warrior's awakening, all wrapped into one.",
    note: "If you walk this journey with honesty, humility, and hunger — you will not be the same person on the other side.",
  },
  rhythm: {
    eyebrow: "VI · How This Works",
    title: "How Each Module Works",
    intro: "Every module follows the same seven-part rhythm — so you know exactly what to expect, and exactly where God meets you on the page.",
    close: "This workbook is not meant to be read through — it is meant to be walked and worked through. Day by day. One module at a time.",
  },
  promise: {
    eyebrow: "VII · The Promise",
    title: "What You Will Become",
    intro: "If you give yourself fully to this journey, you will become:",
    pairs: [
      ["Clearer in purpose", "Cleaner in conscience"],
      ["Stronger in mind", "Sharper in discernment"],
      ["Steadier in obedience", "More resilient under pressure"],
      ["More aligned in righteousness", "More anchored in hope"],
      ["More confident in Christ", "More dangerous to darkness"],
    ],
    punch: "This isn't behavior modification. This is identity activation.",
    close: "And this is not just about you. There are people on the other side of your obedience who need who you're becoming. Your spouse. Your kids. Your team. The broken man sitting next to you who doesn't know yet that God is going to use someone exactly like you to reach him.",
  },
  posture: {
    eyebrow: "VIII · The Warrior's Posture",
    title: "The Warrior's Posture",
    intro: "Before you begin, settle this in your heart. Five postures that turn a reader into a participant:",
    items: [
      { word: "Come Hungry.",      desc: "Bring an appetite for God that no other voice can satisfy. Hunger is what God fills." },
      { word: "Come Humble.",      desc: "Lay down what you think you already know. The Spirit cannot teach a heart that refuses to bend." },
      { word: "Come Honest.",      desc: "Bring the heart you actually have — not the heart you pretend to have. He already knows." },
      { word: "Come Surrendered.", desc: "Stop negotiating with God. The warrior's strength begins where his self-protection ends." },
      { word: "Come Expectant.",   desc: "Show up like God will actually do something. Because He will." },
    ],
    close: "The Holy Spirit cannot shape the heart you pretend to have. He transforms the heart you actually bring Him.",
  },
  questions: {
    eyebrow: "IX · Questions Before Day One",
    title: "Questions Before Day One",
    intro: "Take your time. No one is grading you. These are between you and God.",
    items: [
      "What brought you to this moment? Be honest — what broke you, wore you down, or drove you here?",
      "What areas of your walk with God feel weakest or most unsteady right now?",
      "What do you secretly hope God will heal, shift, restore, or awaken in you over these 14 days?",
      "Who is waiting on the other side of your change? Who needs who you're going to become?",
    ],
  },
  commitment: {
    eyebrow: "X · The Warrior's Commitment",
    title: "The Warrior's Commitment",
    intro: "Don't skip this. A warrior who won't commit before the battle has already lost it. Write your name. Write the date. Own this.",
    pledge: "I, ___________, on ___________, choose to begin this 14-day journey. I am not doing this because I feel ready. I am doing this because I am willing.",
    aloud: "\"I enter this journey with open hands, open heart, and open spirit. Transform me, Lord.\"",
  },
  prayer: {
    eyebrow: "XI · Prayer of Consecration",
    title: "Prayer of Consecration",
    body: [
      "Lord Jesus,",
      "I set apart this time for You.",
      "I didn't come here because I had it figured out. I came because I'm tired of being empty. I came because something in me still believes You're not finished with me yet.",
      "I surrender my heart, my habits, my wounds, my desires, and my mindset.",
      "Shape me. Correct me. Strengthen me. Refine me. Awaken me.",
      "Make me a warrior marked by Your presence, anchored in Your truth, and forged in Your fire.",
      "I begin this journey with hunger and humility. Walk with me through every page.",
    ],
    amen: "— Amen —",
  },
};

/* ---------------------------------------------------------------------------
   MODULES 0–14
--------------------------------------------------------------------------- */
const MODULES = [
  {
    id: 0,
    roman: "0",
    day: null,
    pillar: "identity",
    kicker: "The Call to the Warrior's Path",
    name: "Welcome to the Journey",
    subtitle: "The Call to the Warrior's Path",
    coreIdea: "You were made for more than survival — you were forged for victory.",
    type: "welcome",
    content: MODULE_0,
  },
  {
    id: 1, roman: "I", day: 1, pillar: "purpose",
    name: "The Warrior's Why", subtitle: "Called into the Fight",
    coreIdea: "You're not just saved from something — you're saved for something.",
    scriptures: ["Ephesians 2:10", "2 Timothy 1:9", "Romans 8:28"],
    creed: "My purpose is God-given, blood-bought, and Spirit-powered.",
  },
  {
    id: 2, roman: "II", day: 2, pillar: "identity",
    name: "The Warrior's Attitude", subtitle: "The Lens That Shapes the Battle",
    coreIdea: "You can't always choose your battles, but you can choose your attitude in them.",
    scriptures: ["Philippians 4:4–8", "James 1:2–4", "1 Thessalonians 5:16–18"],
    creed: "I am a thermostat, not a thermometer — I set the climate of the room.",
  },
  {
    id: 3, roman: "III", day: 3, pillar: "formation",
    name: "Holy Resilience", subtitle: "Built Under Pressure",
    coreIdea: "Pressure isn't your enemy — it's the environment where strength is forged.",
    scriptures: ["Romans 5:3–5", "James 1:12", "2 Corinthians 4:8–9"],
    creed: "What is meant to break me is being used to build me.",
  },
  {
    id: 4, roman: "IV", day: 4, pillar: "identity",
    name: "The Warrior's Alignment", subtitle: "Standing Tall in a Crooked World",
    coreIdea: "Righteousness isn't perfection — it's alignment.",
    scriptures: ["Matthew 5:6", "Romans 6:13", "Proverbs 4:25–27"],
    creed: "I am aligned with God, not the crowd.",
  },
  {
    id: 5, roman: "V", day: 5, pillar: "purpose",
    name: "The Warrior's Influence", subtitle: "Presence That Shifts Atmospheres",
    coreIdea: "You don't just enter environments — you shape them.",
    scriptures: ["Matthew 5:13–16", "Philippians 2:15", "Acts 4:13"],
    creed: "I carry heaven's atmosphere into every room I enter.",
  },
  {
    id: 6, roman: "VI", day: 6, pillar: "sanctification",
    name: "The Warrior's Obedience", subtitle: "The Yes That Unlocks Breakthrough",
    coreIdea: "Obedience is the doorway breakthrough walks through.",
    scriptures: ["1 Samuel 15:22", "John 14:15", "James 1:22"],
    creed: "My obedience is the key; God holds the door.",
  },
  {
    id: 7, roman: "VII", day: 7, pillar: "warfare",
    name: "The Warrior's Resolve", subtitle: "Setting Your Face Like Flint",
    coreIdea: "A warrior with resolve is a warrior hell cannot move.",
    scriptures: ["Isaiah 50:7", "Luke 9:51", "1 Corinthians 15:58"],
    creed: "I have set my face like flint. I will not be moved.",
  },
  {
    id: 8, roman: "VIII", day: 8, pillar: "warfare",
    name: "Module Eight", subtitle: "Outline pending",
    coreIdea: "Content to be defined — this station is reserved in the journey.",
    scriptures: [],
    creed: "",
    placeholder: true,
  },
  {
    id: 9, roman: "IX", day: 9, pillar: "sanctification",
    name: "Experiential Sanctification", subtitle: "Walking Out What's Already True",
    coreIdea: "Sanctification is God working in you — and you cooperating with Him.",
    scriptures: ["Philippians 2:12–13", "1 Thessalonians 4:3", "2 Corinthians 3:18"],
    creed: "I am becoming, in practice, who God already calls me in truth.",
  },
  {
    id: 10, roman: "X", day: 10, pillar: "warfare",
    name: "The Inner Battle: Flesh vs Spirit", subtitle: "The War Within",
    coreIdea: "The dog that wins is the one you keep feeding.",
    scriptures: ["Galatians 5:16–17", "Romans 8:5–9", "1 Peter 2:11"],
    creed: "I starve the flesh and feed the Spirit.",
  },
  {
    id: 11, roman: "XI", day: 11, pillar: "sanctification",
    name: "Module Eleven", subtitle: "Outline pending",
    coreIdea: "Content to be defined — this station is reserved in the journey.",
    scriptures: [],
    creed: "",
    placeholder: true,
  },
  {
    id: 12, roman: "XII", day: 12, pillar: "sanctification",
    name: "Repentance & Confession", subtitle: "Keeping Short Accounts",
    coreIdea: "Holiness is honesty with God and humility with people.",
    scriptures: ["1 John 1:8–9", "Psalm 51:1–10", "James 5:16"],
    creed: "I keep short accounts with God and clean hands with people.",
  },
  {
    id: 13, roman: "XIII", day: 13, pillar: "formation",
    name: "Community & Counsel", subtitle: "You Don't Fight Alone",
    coreIdea: "Isolation is where warriors fall; community is where warriors heal.",
    scriptures: ["Hebrews 10:24–25", "Proverbs 27:17", "Ecclesiastes 4:9–12"],
    creed: "I was never meant to fight alone.",
  },
  {
    id: 14, roman: "XIV", day: 14, pillar: "hope",
    name: "Glorification & Hope", subtitle: "Fighting with the Finish Line in Sight",
    coreIdea: "You fight differently when you know how the story ends.",
    scriptures: ["Romans 8:18–23", "Revelation 21:1–5", "2 Timothy 4:7–8"],
    creed: "I fight from victory, not for it — the end is already written.",
  },
];

/* Brand-level copy. */
const BRAND = {
  name: "The Warriors Project",
  wordmark: "WARRIORS",
  tagline: "Transforming Pain Into Power",
  promise: "Heal. Find Purpose. Be Restored.",
  founder: "Robert Lindenberg",
  journeyName: "The Warrior's Path",
};

/* The six pillars, in journey order, with the modules grouped under each. */
function pillarGroups() {
  const order = ["identity", "purpose", "formation", "warfare", "sanctification", "hope"];
  return order.map((key) => ({
    ...PILLARS[key],
    modules: MODULES.filter((m) => m.id !== 0 && m.pillar === key),
  }));
}

if (typeof window !== "undefined") {
  window.WARRIORS = { PILLARS, RHYTHM, MODULES, BRAND, pillarGroups };
}
