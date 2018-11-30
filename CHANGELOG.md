# Change Log
All notable changes to the "svelte-intellisense" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]
- [Added] Auto-completion for component assign properties
- [Added] Sugestions for data properties that have `@type` attribute with union constant types, like `{('plain'|'primary'|'secondary')}`

## [0.3.0]
- [Fixed] Issue #8: Your extension is affected by event stream and have been blocked
- [Fixed] Issue #2 with `:catch` and `:then` svelte syntax auto-insertion
- [Fixed] Issue #3 with `ref:`, `transition:`, `in:`, `out:`, `use:` auto-insertion when user press <kbd>:</kbd>
- [Fixed] Improved auto-completion for `this.`
- [Fixed] Issue with auto-completion in `this.refs.<>`
- [Fixed] Issue with providing completion item of `ref:` from markup into script block, now provided a correct completion item `refs.` with proper description
- [Added] Auto-completion for single property getter `this.get().<>`
- [Added] Auto-completion for data and computed properties and helper methods in `{#if _}`, `{:elseif _}`, `{#each _}`, `{#await _}` statements
- [Added] Auto-completion for bind target property in `bind:...=<>` syntax in markup

## [0.2.0]
- [Fixed] Auto-completion for nested blocks
- [Added] Hover for component tag documentation in template
- [Added] Hover for imported component documentation in script
- [Added] Auto-completions for template:
    - Special svelte components syntax - `svelte:window`, `svelte:document`, `svelte:head`, `svelte:component`.
    - Special svelte tags syntax - `@debug`, `@html`. 
    - Reference syntax for html elements - `ref:...`.
    - Standard bindings for html elements - `bind:...`.
    - Class syntax for html elements - `class:...`.
    - Accessible data, computed, helpers in `{}`.
    - Accessible data, computed, methods in attribute values like `on:event="..."`.
    - Accessible transitions for html elements - `transition:...`, `in:...`, `out:...`.
    - Accessible actions for html elements - `use:...`.
    - Accessible bindings for component tags - `<Button bind:...`.
    - Accessible events for component tags - `<Button on:...`.
    - Accessible props for component tags - `<Button foo bar=...`.
    - Accessible slots inside component tags - `<div slot=...`.
- [Added] Auto-completions for script:
    - Default svelte component methods - `get`, `set`, `fire`.
    - Component references - `this.refs.`.
    - Own component methods.
    - Component state setter properties - `this.set({})`.
    - Component state properties for getter - `const { prop } = this.get()`.
    - Component computed property dependecies - `computedProp: ({prop}) => ...`.
    - Scripts path in `import` statement.
- [Added] Auto-completions for styles:
    - `ref:*` selector

## [0.1.1]
- [Fixed] Issue with hover spamming output

## [0.1.0]
- [Added] Auto-completions: 
    - Path for importing components with support of node_modules search
    - svelte language items
    - own component data, computed etc.
- [Added] Hover information about imported component