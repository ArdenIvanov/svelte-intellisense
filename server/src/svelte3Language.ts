import {
    CompletionItem, CompletionItemKind,
    MarkupContent, MarkupKind, InsertTextFormat
} from 'vscode-languageserver';

export const svelte3DefaultHtmlTagBindCompletionItems = [
    {
        allowedHtmlTags: null,
        restrictedHtmlTags: ['svelte:window','svelte:body','svelte:head','svelte:options'],
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
            },
            {
                label: 'this',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:this={variable}',
                documentation: {
                    kind: MarkupKind.PlainText,
                    value: `Gets a reference to a DOM node`
                },
            },
        ]
    },
];

export const svelte3DefaultClassCompletionItem: CompletionItem = {
    label: 'class:...',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] class:<css-class>="{condition}"',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
`
Classes let you toggle element classes on and off. 
To use classes add the directive class followed by a colon and the class name you want toggled (\`class:the-class-name="{anExpression}"\`). 
The expression inside the directive's quotes will be evaluated and toggle the class on and off depending on the truthiness of the expression's result. 
You can only add class directives to elements.
`
    },
    insertText: 'class:',
    preselect: true,
};

export const svelte3DefaultActionCompletionItem: CompletionItem = {
    label: 'use:...',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] use:<action>={parameters}',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
`
Actions are functions that are called when an element is created. 
They can return an object with a destroy method that is called after the element is unmounted.

An action can have parameters. 
If the returned value has an \`update\` method, it will be called whenever those parameters change, immediately after Svelte has applied updates to the markup.

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

export const svelte3DefaultEventHandlerCompletionItem: CompletionItem = {
    label: 'on:...',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] on:<event>="{handler}"',
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

export const svelte3DefaultBindInstanceCompletionItem: CompletionItem = {
    label: 'bind:this...',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] bind:this={component_instance}',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
`
Allows to interact with component instances programmatically..
`
    },
    insertText: 'bind:this={${0:instance}}',
};

export const svelte3DefaultSlotPropertyCompletionItem: CompletionItem = {
    label: 'let:...',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] let:item="item"',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
`
Slots can be rendered zero or more times, and can pass values back to the parent using props. 
The parent exposes the values to the slot template using this directive.
`
    },
    insertText: 'let:'
};

export const svelte3MarkupBlockInnerCompletitionItems = {
    'if': [
        <CompletionItem>{
            label: 'else if',
            kind: CompletionItemKind.Keyword,
            detail: 'Svelte {:else if condition}',
            documentation: {
                kind: MarkupKind.Markdown,
                value: `Handle additional condition if previous one are failed.`
            },
            insertText: 'else if ${0:condition}',
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

export const svelte3MarkupBlockCompletitionItems: Array<CompletionItem> = [
    <CompletionItem>{
        label: 'if',
        kind: CompletionItemKind.Keyword,
        detail: 'Svelte {#if condition}',
        documentation: <MarkupContent>{
            kind: MarkupKind.Markdown,
            value: 
`Standart language conditional block construction with supporting \`else\` and \`else if\` blocks.

### Example
\`\`\`
{#if condition1}
<!-- Handle this case when condition1 is true -->
{:else if condition2}
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
`\`\`\`
{#each expression as name}...{/each}
{#each expression as name, index}...{/each}
{#each expression as name, index (key)}...{/each}
{#each expression as name}...{:else}...{/each}
\`\`\`

Iterating over lists of values can be done with an each block.
An each block can also specify an \`index\`, equivalent to the second argument in an \`array.map(...)\` callback.
If a \`key\` expression is provided — which must uniquely identify each list item — 
Svelte will use it to diff the list when data changes, rather than adding or removing items at the end. 
The key can be any object, but strings and numbers are recommended since they allow identity to persist when the objects themselves change.
You can freely use destructuring patterns in each blocks.
An each block can also have an \`{:else}\` clause, which is rendered if the list is empty.

### Example
\`\`\`
{#each items as { id, name, qty }, i (id)}
	<li>{i + 1}: {name} x {qty}</li>
{:else}
    <li>No items!</li>
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


export const svelte3SpecialComponents: Array<CompletionItem> = [
    {
        label: 'self',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`Allows a component to include itself, recursively.
It cannot appear at the top level of your markup; it must be inside an if or each block to prevent an infinite loop.`
        },
    },
    {
        label: 'component',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`\`\`\`
<svelte:component this={expression}>
\`\`\`

Renders a component dynamically, using the component constructor specified as the \`this\` property. 
When the property changes, the component is destroyed and recreated.

If \`this\` is falsy, no component is rendered.`
        },
    },
    {
        label: 'body',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`\`\`\`
<svelte:body on:event={handler}/>
\`\`\`
Allows you to add listeners to events on \`document.body\`, such as \`mouseenter\` and \`mouseleave\` which don't fire on window.`
        },
    },
    {
        label: 'window',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`\`\`\`
<svelte:window on:event={handler}/>
<svelte:window bind:prop={value}/>
\`\`\`
Allows you to add event listeners to the window object without worrying about removing them when the component is destroyed, 
or checking for the existence of window when server-side rendering.`
        },
    },
    {
        label: 'head',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`This element makes it possible to insert elements into \`document.head\`. During server-side rendering, \`head\` content exposed separately to the main \`html\` content.`
        },
    },
    {
        label: 'options',
        kind: CompletionItemKind.Class,
        detail: '[Svelte] Special component',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`\`\`\`
<svelte:options option={value}>
\`\`\`

Provides a place to specify per-component compiler options. The possible options are: 
- \`immutable={true}\` — you never use mutable data, so the compiler can do simple referential equality checks to determine if values have changed.
- \`immutable={false}\` — the default. Svelte will be more conservative about whether or not mutable objects have changed.
- \`accessors={true}\` — adds getters and setters for the component's props.
- \`accessors={false}\` — the default
- \`namespace="..."\` — the namespace where this component will be used, most commonly "svg"
- \`tag="..."\` — the name to use when compiling this component as a custom element`
        },
    },
];
