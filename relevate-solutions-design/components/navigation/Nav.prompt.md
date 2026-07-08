Sticky site header: globe logo + wordmark with cyan tracked sub-line, horizontal nav links, and CTA buttons.

```jsx
<Nav
  logoSrc="assets/relevate-globe.png"
  activeHref="/about/"
  links={[{href:'/',label:'Home'},{href:'/about/',label:'About'},{href:'/contact/',label:'Contact'}]}
  actions={<><Button variant="dark" size="sm" href="#">Make a Payment</Button><Button variant="primary" size="sm" href="#">Book a Consultation</Button></>}
/>
```

Mobile breakpoint (theme: 1120px) collapses links into a hamburger drawer — recreate with plain CSS media queries in the consuming page if needed; the component itself renders the desktop row.
