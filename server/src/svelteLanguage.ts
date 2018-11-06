import {
    CompletionItem, CompletionItemKind,
    MarkupContent, MarkupKind
} from 'vscode-languageserver';

export const markupBlockInnerCompletitionItems = {
    'if': [
        <CompletionItem>{
            label: 'elseif',
            kind: CompletionItemKind.Keyword,
            detail: 'Svelte {:elseif condition}',
            documentation: <MarkupContent>{
                kind: MarkupKind.Markdown,
                value: `Handle additional condition if previous one are failed.`
            }
        },
        <CompletionItem>{
            label: 'else',
            kind: CompletionItemKind.Keyword,
            detail: 'Svelte {:else}',
            documentation: <MarkupContent>{
                kind: MarkupKind.Markdown,
                value: `Handle case when all previous conditions of if statement are failed.`
            }
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
            }
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
            }
        },
        <CompletionItem>{
            label: 'catch',
            kind: CompletionItemKind.Keyword,
            detail: 'Svelte {:catch e}',
            documentation: <MarkupContent>{
                kind: MarkupKind.Markdown,
                value: `Handle state when JS Promise object are rejected.`
            }
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
        preselect: true
    },
];