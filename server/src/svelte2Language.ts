import {
    CompletionItem, CompletionItemKind,
    MarkupContent, MarkupKind, InsertTextFormat
} from 'vscode-languageserver';

export const svelte2DefaultHtmlTagBindCompletionItems = [
    {
        allowedHtmlTags: null,
        restrictedHtmlTags: ['svelte:window'],
        items: [
            {
                label: 'offsetWidth',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:offsetWidth={data} (One-Way)',
            },
            {
                label: 'offsetHeight',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:offsetHeight={data} (One-Way)',
            },
            {
                label: 'clientWidth',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:clientWidth={data} (One-Way)',
            },
            {
                label: 'clientHeight',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:clientHeight={data} (One-Way)',
            }
        ]
    },
];

export const svelte2DefaultScriptRefsCompletionItem: CompletionItem = {
    label: 'refs',
    kind: CompletionItemKind.Property,
    detail: '[Svelte] refs',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
        `
Refs are a convenient way to store a reference to particular DOM nodes or components.
Declare a ref with \`ref:[name]\`, and access it inside your component's methods with \`this.refs.[name]\`.
\`\`\`
        `     
    },
    insertText: 'refs'
};

export const svelte2DefaultRefCompletionItem: CompletionItem = {
    label: 'ref:...',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] ref:<name>',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
`
Refs are a convenient way to store a reference to particular DOM nodes or components. 
Declare a ref with \`ref:[name]\`, and access it inside your component's methods with \`this.refs.[name]\`.

**Keep Attention!**
Since only one element or component can occupy a given ref, don't use them in \`{#each ...}\` blocks. 
It's fine to use them in \`{#if ...}\` blocks however.

Note that you can use refs in your \`<style>\` blocks.
\`\`\`
`
    },
    insertText: 'ref:',
    preselect: true,
};

export const svelte2DefaultClassCompletionItem: CompletionItem = {
    label: 'class:...',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] class:<css-class>="condition"',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
`
Classes let you toggle element classes on and off. 
To use classes add the directive class followed by a colon and the class name you want toggled (\`class:the-class-name="anExpression"\`). 
The expression inside the directive's quotes will be evaluated and toggle the class on and off depending on the truthiness of the expression's result. 
You can only add class directives to elements.
`
    },
    insertText: 'class:',
    preselect: true,
};

export const svelte2DefaultActionCompletionItem: CompletionItem = {
    label: 'use:...',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] use:<action>="data"',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
`
Actions let you decorate elements with additional functionality. 
Actions are functions which may return an object with lifecycle methods, \`update\` and \`destroy\`. 
The action will be called when its element is added to the DOM.

Use actions for things like:

- tooltips
- lazy loading images as the page is scrolled, e.g. \`<img use:lazyload data-src='giant-photo.jpg'/>\`
- capturing link clicks for your client router
- adding drag and drop
`
    },
    insertText: 'use:',
    preselect: true,
};

export const svelte2DefaultEventHandlerCompletionItem: CompletionItem = {
    label: 'on:...',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] on:<event>="handler"',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
`
In most applications, you'll need to respond to the user's actions. In Svelte, this is done with the \`on:[event]\` directive.
You can call any method belonging to the component (whether built-in or custom), and any data property (or computed property) that's in scope.
`
    },
    insertText: 'on:',
    preselect: true,
};

export const svelte2DefaultComponentGetMethodCompletionItem: CompletionItem = {
    label: 'get',
        kind: CompletionItemKind.Method,
        detail: '[Svelte] get()',
        documentation: {
            kind: MarkupKind.Markdown,
            value:
`
Returns the component's current state. This will also retrieve the value of computed properties.
`
        },
        insertText: 'get()'
};

export const svelte2DefaultComponentMethods: Array<CompletionItem> = [
    {
        label: 'set',
        kind: CompletionItemKind.Method,
        detail: '[Svelte] set({...})',
        documentation: {
            kind: MarkupKind.Markdown,
            value:
`
This updates the component's state with the new values provided and causes the DOM to update. 
State must be a plain old JavaScript object (POJO). 
Any properties not included in state will remain as they were.
`
        },
        insertText: 'set({$0})',
        insertTextFormat: InsertTextFormat.Snippet
    },
    {
        label: 'fire',
        kind: CompletionItemKind.Method,
        detail: '[Svelte] fire(name: string, event?: any)',
        documentation: {
            kind: MarkupKind.Markdown,
            value:
`
Trigger the event with specified name to parent component.
Optionally you can specify event object as a second parameter.
`
        },
        insertText: 'fire(\'$0\')',
        insertTextFormat: InsertTextFormat.Snippet
    }
];

export const svelte2MarkupBlockInnerCompletitionItems = {
    'if': [
        <CompletionItem>{
            label: 'elseif',
            kind: CompletionItemKind.Keyword,
            detail: 'Svelte {:elseif condition}',
            documentation: {
                kind: MarkupKind.Markdown,
                value: `Handle additional condition if previous one are failed.`
            },
            insertText: 'elseif ${0:condition}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '1'
        },
        <CompletionItem>{
            label: 'else',
            kind: CompletionItemKind.Keyword,
            detail: 'Svelte {:else}',
            documentation: {
                kind: MarkupKind.Markdown,
                value: `Handle case when all previous conditions of if statement are failed.`
            },
            sortText: '2'
        }
    ],
};

export const svelte2MarkupBlockCompletitionItems: Array<CompletionItem> = [
    <CompletionItem>{
        label: 'if',
        kind: CompletionItemKind.Keyword,
        detail: 'Svelte {#if condition}',
        documentation: <MarkupContent>{
            kind: MarkupKind.Markdown,
            value: 
`Standart language conditional block construction with supporting \`else\` and \`elseif\` blocks.

### Example
\`\`\`
{#if condition1}
<!-- Handle this case when condition1 is true -->
{:elseif condition2}
<!-- Handle this case when condition2 is true -->
{:else}
<!-- Handle this case when all conditions are failed -->
{/if}
\`\`\`
`
        },
        insertText: 'if ${1:condition}}\n\t$0\n{/if',
        insertTextFormat: InsertTextFormat.Snippet,
        sortText: '1',
        preselect: true
    },
    <CompletionItem>{
        label: 'each',
        kind: CompletionItemKind.Keyword,
        detail: 'Svelte {#each list as item}',
        documentation: <MarkupContent>{
            kind: MarkupKind.Markdown,
            value: 
`Iterates by each items in the list with possibility to handle empty state of list.

### Example
\`\`\`
{#each list as item}
<!-- Handle item markup -->
{:else}
<!-- Handle empty list state -->
{/each}
\`\`\`
`
        },
        insertText: 'each ${1:list} as ${2:item}}\n\t$0\n{/each',
        insertTextFormat: InsertTextFormat.Snippet,
        sortText: '2',
        preselect: true
    },
];

export const svelte2SpecialComponents: Array<CompletionItem> = [
    {
        label: 'self',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`Sometimes, a component needs to embed itself recursively — for example if you have a tree-like data structure.`
        },
    },
    {
        label: 'component',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`If you don't know what kind of component to render until the app runs — in other words, it's driven by state.`
        },
    },
    {
        label: 'document',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
``
        },
    },
    {
        label: 'window',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`The \`<svelte:window>\` tag gives you a convenient way to declaratively add event listeners to window. 
Event listeners are automatically removed when the component is destroyed.`
        },
    },
    {
        label: 'head',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`If you're building an application with Svelte — particularly if you're using Sapper — then it's likely you'll need to add some content to the \`<head>\` of your page, such as adding a \`<title>\` element.`
        },
    }
];
