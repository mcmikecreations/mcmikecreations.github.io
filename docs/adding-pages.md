# Adding a new page

When adding a new page, there is a set of actions that an author needs to perform.

- Add `<AppTitle title="My title" />` tag to set the title of the page.
- Add `footer: { pinBottom: false, showSocials: false }` to the `+page.svelte` or `+layout.svelte` load function to specify footer parameters.
- Add `<AppFooter />` to add the actual footer.
- Verify correct history state management if applicable.
