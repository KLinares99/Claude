General-purpose surface card — the workhorse container for services, values, team bios, and pillar copy across the site.

```jsx
<Card variant="featured" icon={<svg .../>} title="Tax Services">
  Personal & business returns, sales tax filing, and audit resolution.
</Card>

<Card variant="person" avatar="RC" title="Raymond Castro">
  CEO · Life & Financial Coach
</Card>

<Card variant="numbered" eyebrow="01" title="Stewardship">
  We treat every dollar we touch as a trust.
</Card>
```

`default` is a plain bordered card (e.g. mission/positioning pairs). `featured` adds the cyan top border + icon chip used on the six service cards. `person` centers content with a gradient initials avatar. `numbered` shows a small cyan eyebrow (numeral or word) above the title — used for values and pillars.
