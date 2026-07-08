Labeled form input used in the quote-request and contact forms.

```jsx
<FormField label="Full Name" placeholder="Jane Doe" />
<FormField label="Service Needed" as="select" options={['Accounting', 'Tax Prep', 'Payroll', 'Coaching']} />
<FormField label="Tell us more" as="textarea" placeholder="What can we help with?" />
```

Focus state (cyan border + soft ring) is implemented via CSS in the consuming page's `<style>` since inline styles can't express `:focus` — copy the `--focus-ring` token.
