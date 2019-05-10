import {
    CompletionItem, CompletionItemKind,
    MarkupContent, MarkupKind, InsertTextFormat
} from 'vscode-languageserver';
import { SvelteDocument } from './SvelteDocument';

export interface VersionSpecific {
    version: number;
    specific: any;
}

export function getVersionSpecificSelection(document: SvelteDocument, versionsSpecific: VersionSpecific[]): any {
    const requiredVersion = document.svelteVersion();
    return versionsSpecific.find(versionSpecific => {
        return versionSpecific.version === requiredVersion;
    }).specific;
}

export function getHtmlTagDefaultBindCompletionItems(tagName: string, versionSpecificItems: Array<any>): Array<CompletionItem> {
    const result = [];

    const populator = (list: Array<any>) => {
        list.forEach(rule => {
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
    }
    populator(DefaultHtmlTagBindCompletionItems);
    populator(versionSpecificItems);

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
        insertText: 'out:',
        preselect: true
    }
]

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

export const markupBlockInnerCompletitionItems = {
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
            insertText: 'then ${0:data}',
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
            insertText: 'catch ${0:error}',
            insertTextFormat: InsertTextFormat.Snippet,
            sortText: '2'
        },
    ]
};

export const markupBlockCompletitionItems: Array<CompletionItem> = [
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

export const EventModifiers: Array<CompletionItem> = [
    {
        label: 'preventDefault',
        kind: CompletionItemKind.Keyword,
        detail: '[Svelte] Event modifiers',
        documentation: {
            kind: MarkupKind.Markdown,
            value: `Calls \`event.preventDefault()\` before running the handler`
        },
    },
    {
        label: 'stopPropagation',
        kind: CompletionItemKind.Keyword,
        detail: '[Svelte] Event modifiers',
        documentation: {
            kind: MarkupKind.Markdown,
            value: `Calls \`event.stopPropagation()\`, preventing the event reaching the next element`
        },
    },
    {
        label: 'passive',
        kind: CompletionItemKind.Keyword,
        detail: '[Svelte] Event modifiers',
        documentation: {
            kind: MarkupKind.Markdown,
            value: `Improves scrolling performance on touch/wheel events (Svelte will add it automatically where it's safe to do so)`
        },
    },
    {
        label: 'capture',
        kind: CompletionItemKind.Keyword,
        detail: '[Svelte] Event modifiers',
        documentation: {
            kind: MarkupKind.Markdown,
            value: `Fires the handler during the capture phase instead of the bubbling phase`
        },
    },
    {
        label: 'once',
        kind: CompletionItemKind.Keyword,
        detail: '[Svelte] Event modifiers',
        documentation: {
            kind: MarkupKind.Markdown,
            value: `Removes the handler after the first time it runs`
        },
    },
];