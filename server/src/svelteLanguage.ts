import {
    CompletionItem, CompletionItemKind,
    MarkupContent, MarkupKind, InsertTextFormat
} from 'vscode-languageserver';

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