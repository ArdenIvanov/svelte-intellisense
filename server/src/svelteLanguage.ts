import {
    CompletionItem, CompletionItemKind,
    MarkupContent, MarkupKind, InsertTextFormat
} from 'vscode-languageserver';

export function getHtmlTagDefaultBindCompletionItems(tagName: string): Array<CompletionItem> {
    const result = [];

    DefaultHtmlTagBindCompletionItems.forEach(rule => {
        if (rule.restrictedHtmlTags) {
            if (rule.restrictedHtmlTags.some(restrictedTagName => restrictedTagName === tagName)) {
                return;
            }
        }

        if (rule.allowedHtmlTags) {
            if (rule.allowedHtmlTags.every(allowedTagName => allowedTagName !== tagName)) {
                return;
            }
        }

        result.push(...rule.items);
    });

    return result;
}

export const DefaultHtmlTagBindCompletionItems = [
    {
        allowedHtmlTags: ['input', 'textarea', 'select'],
        items: [{
            label: 'value',
            kind: CompletionItemKind.Property,
            detail: '[Svelte] bind:value={data}',
            documentation: {
                kind: MarkupKind.Markdown,
                value: `Handle HTML input controls \`value\` binding.`
            }
        }]
    },
    {
        allowedHtmlTags: ['input'],
        items: [
            {
                label: 'checked',
                kind: CompletionItemKind.Property,
                detail: '[Svelte] bind:checked={data}',
                documentation: {
                    kind: MarkupKind.Markdown,
                    value: `Handle HTML input with \`type="checkbox"\` attribute check-state binding.`
                }
            },
            {
                label: 'group',
                kind: CompletionItemKind.Property,
                detail: '[Svelte] bind:group={data}',
                documentation: {
                    kind: MarkupKind.Markdown,
                    value: 
`\`group\` bindings allow you to capture the current value of a set of radio inputs, or all the selected values of a set of checkbox inputs.`
                }
            },
        ]
    },
    {
        allowedHtmlTags: ['audio', 'video'],
        items: [
            {
                label: 'currentTime',
                kind: CompletionItemKind.Property,
                detail: '[Svelte] bind:currentTime={data}',
            },
            {
                label: 'paused',
                kind: CompletionItemKind.Property,
                detail: '[Svelte] bind:paused={data}',
            },
            {
                label: 'played',
                kind: CompletionItemKind.Property,
                detail: '[Svelte] bind:played={data}',
            },
            {
                label: 'volume',
                kind: CompletionItemKind.Property,
                detail: '[Svelte] bind:volume={data}',
            },
            {
                label: 'buffered',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:buffered={data} (One-Way)',
            },
            {
                label: 'duration',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:duration={data} (One-Way)',
            },
            {
                label: 'seekable',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:seekable={data} (One-Way)',
            }
        ]
    },
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
    {
        allowedHtmlTags: ['svelte:window'],
        items: [
            {
                label: 'scrollX',
                kind: CompletionItemKind.Property,
                detail: '[Svelte] bind:scrollX={data}',
            },
            {
                label: 'scrollY',
                kind: CompletionItemKind.Property,
                detail: '[Svelte] bind:scrollX={data}',
            },

            {
                label: 'online',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:online={data} (One-Way)',
            },
            {
                label: 'innerWidth',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:innerWidth={data} (One-Way)',
            },
            {
                label: 'innerHeight',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:innerHeight={data} (One-Way)',
            },
            {
                label: 'outerWidth',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:outerWidth={data} (One-Way)',
            },
            {
                label: 'outerHeight',
                kind: CompletionItemKind.Constant,
                detail: '[Svelte] bind:outerHeight={data} (One-Way)',
            }
        ]
    }
];

export const DefaultTransitionCompletionItems: CompletionItem[] = [
    {
        label: 'transiontion:...',
        kind: CompletionItemKind.Keyword,
        detail: '[Svelte] transition:<function>="{ settings }"',
        documentation: {
            kind: MarkupKind.Markdown,
            value: `Transitions allow elements to enter and leave the DOM gracefully, rather than suddenly appearing and disappearing.`
        },
        commitCharacters: [':'],
        insertText: 'transition:',
        preselect: true
    },
    {
        label: 'in:...',
        kind: CompletionItemKind.Keyword,
        detail: '[Svelte] transition:<function>="{ settings }"',
        documentation: {
            kind: MarkupKind.Markdown,
            value: `In transitions allow elements to enter the DOM gracefully, rather than suddenly appearing.`
        },
        commitCharacters: [':'],
        insertText: 'in:',
        preselect: true
    },
    {
        label: 'out:...',
        kind: CompletionItemKind.Keyword,
        detail: '[Svelte] transition:<function>="{ settings }"',
        documentation: {
            kind: MarkupKind.Markdown,
            value: `Out transitions allow elements to leave the DOM gracefully, rather than suddenly disappearing.`
        },
        commitCharacters: [':'],
        insertText: 'out:',
        preselect: true
    }
]

export const DefaultRefCompletionItem: CompletionItem = {
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
    commitCharacters: [':'],
    insertText: 'ref:',
    preselect: true,
};

export const DefaultClassCompletionItem: CompletionItem = {
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

export const DefaultActionCompletionItem: CompletionItem = {
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

export const DefaultEventHandlerCompletionItem: CompletionItem = {
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

export const DefaultBindCompletionItem: CompletionItem = {
    label: 'bind:...',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] bind:<data>={data}',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
`
Component bindings keep values in sync between a parent and a child.
`
    },
    insertText: 'bind:',
    preselect: true,
};

export const DefaultSlotCompletionItem: CompletionItem = {
    label: 'slot="..."',
    kind: CompletionItemKind.Keyword,
    detail: '[Svelte] slot="name"',
    documentation: {
        kind: MarkupKind.Markdown,
        value:
`
Allows the current component to inject content into this component.
`
    },
    insertText: 'slot='
};

export const DefaultComponentMethods: Array<CompletionItem> = [
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

export const markupBlockInnerCompletitionItems = {
    'if': [
        <CompletionItem>{
            label: 'elseif',
            kind: CompletionItemKind.Keyword,
            detail: 'Svelte {:elseif condition}',
            documentation: {
                kind: MarkupKind.Markdown,
                value: `Handle additional condition if previous one are failed.`
            },
            insertText: 'elseif ${1:condition}',
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
    'each': [
        <CompletionItem>{
            label: 'else',
            kind: CompletionItemKind.Keyword,
            detail: 'Svelte {:else}',
            documentation: <MarkupContent>{
                kind: MarkupKind.Markdown,
                value: `Handle specific case of each statement when list are empty.`
            },
        },
    ],
    'await': [
        <CompletionItem>{
            label: 'then',
            kind: CompletionItemKind.Keyword,
            detail: 'Svelte {:then data}',
            documentation: <MarkupContent>{
                kind: MarkupKind.Markdown,
                value: `Handle state when JS Promise object are resolved.`
            },
            insertText: 'then ${1:data}\n$0',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '1'
        },
        <CompletionItem>{
            label: 'catch',
            kind: CompletionItemKind.Keyword,
            detail: 'Svelte {:catch e}',
            documentation: <MarkupContent>{
                kind: MarkupKind.Markdown,
                value: `Handle state when JS Promise object are rejected.`
            },
            insertText: 'then ${1:error}\n$0',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '2'
        },
    ]
};

export const markupBlockCompletitionItems: Array<CompletionItem> = [
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
    <CompletionItem>{
        label: 'await',
        kind: CompletionItemKind.Keyword,
        detail: 'Svelte {#await promise}',
        documentation: <MarkupContent>{
            kind: MarkupKind.Markdown,
            value: 
`Construction to handle JS Promise object with pending, resolved and rejected states.

### Example
\`\`\`
{#await promise}
<!-- Pending -->
{:then data}
<!-- Resolved -->
{:catch error}
<!-- Rejected -->
{/await}
\`\`\`
`
        },
        insertText: 'await ${1:promise}}\n\t${2:loading}\n{:then ${3:data}}\n\t$0\n{/await',
        insertTextFormat: InsertTextFormat.Snippet,
        sortText: '3',
        preselect: true
    },
];

export const SpecialComponentNamespace = 'svelte';

export const SpecialComponents: Array<CompletionItem> = [
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

export const PlaceholderModifiers: Array<CompletionItem> = [
    {
        label: '@html',
        kind: CompletionItemKind.Keyword,
        insertText: 'html',
        detail: '[Svelte] Expression',
        documentation: {
            kind: MarkupKind.Markdown,
            value: `Ordinary tags render expressions as plain text. If you need your expression interpreted as HTML, wrap it in a special \`@html\` tag.`
        },
        sortText: '1',
    },
    {
        label: '@debug',
        kind: CompletionItemKind.Keyword,
        insertText: 'debug',
        detail: '[Svelte] Expression',
        documentation: {
            kind: MarkupKind.Markdown,
            value: 
`To inspect data as it changes and flows through your app, use a \`{@debug ...}\` tag.
You can debug multiple values simultaneously (\`{@debug foo, bar, baz}\`), or use \`{@debug}\` to pause execution whenever the surrounding markup is updated.

**Keep attention!**
Debug tags only have an effect when compiling with the \`dev: true\` compiler option.
`
        },
        sortText: '2',
    },
];