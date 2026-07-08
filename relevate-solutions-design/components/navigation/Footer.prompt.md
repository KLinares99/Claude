Dark navy site footer: brand column with bilingual badge, three link columns, bottom copyright bar.

```jsx
<Footer
  logoSrc="assets/relevate-globe.png"
  columns={[
    { title: 'Services', links: [{href:'#',label:'Accounting & Bookkeeping'},{href:'#',label:'Tax Services'}] },
    { title: 'Company', links: [{href:'#',label:'About Us'},{href:'#',label:'Contact'}] },
    { title: 'Contact', links: [{href:'tel:+18455842118',label:'(845) 584-2118'}] },
  ]}
  bottomLeft="© 2026 Relevate Solutions Inc. All rights reserved."
  bottomRight={<a href="#" style={{color:'#9FB4C7'}}>Facebook</a>}
/>
```
