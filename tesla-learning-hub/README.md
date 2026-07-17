# ⚡ Tesla Learning Hub

An interactive learning hub for everything Nikola Tesla — his life, inventions,
patents & blueprints, writings, and (most importantly) his legendary
visualization and dream techniques.

**This is a standalone app.** It lives entirely inside this `tesla-learning-hub/`
folder and shares nothing with the other app in this repository.

## Running it

No build step, no dependencies. Either:

- **Just open it:** double-click `index.html` (works from the filesystem), or
- **Serve it:** from this folder run any static server, e.g.
  `python3 -m http.server 8080`, then open http://localhost:8080

## What's inside

| Section | Contents |
|---|---|
| **Life & Times** | Six biography chapters (1856–1943) + a 34-event interactive timeline through 2013 |
| **Inventions & Projects** | AC polyphase system, induction motor, Tesla coil, radio, remote control, Niagara, Colorado Springs, Wardenclyffe, turbine, Tesla valve, teleforce, and his predictions |
| **Patents & Blueprints** | Searchable library of 28 landmark patents, each linking to the complete original documents and drawings on Google Patents |
| **The Mind Lab** | Tesla's documented visions, nightly imaginal journeys, and mental-prototyping method — plus 8 practical protocols for visualization, incubation, hypnagogia, and lucid dreaming |
| **Library** | His major writings (free full-text links), verified vs. misattributed quotes, 8 myths-vs-facts, and 10 archives/museums |
| **Quiz** | 12 questions with explanations and a running score |

## Sources

Content is compiled from Tesla's autobiography *My Inventions* (1919), his
published articles and patents, and the standard biographies (O'Neill, Cheney,
Carlson). External links go to primary sources: Project Gutenberg, Google
Patents, the FBI Vault, the Nikola Tesla Museum (Belgrade), and the Tesla
Science Center at Wardenclyffe. Quotes are labeled **documented** vs
**attributed**; myths are fact-checked. Practice techniques in the Mind Lab are
modern, evidence-informed constructions inspired by Tesla's methods — clearly
labeled as such, and not medical advice.

## Tech

Plain HTML + CSS + vanilla JavaScript. Hash-based routing, no frameworks, no
network calls except outbound reference links — so it runs anywhere, forever.
