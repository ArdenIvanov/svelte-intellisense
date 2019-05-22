import { SvelteComponentDoc, SvelteDataItem, SvelteComputedItem, SvelteMethodItem } from 'sveltedoc-parser/typings';

export function buildMethodDocumentation(method: SvelteMethodItem) {
    if (!method) {
        return null;
    }

    let result = '``` javascript\n';
    if (method.description) {
        result += `/** ${method.description} */\n`;
    }
    
    result += `${method.name}(`;
    method.args.forEach(arg => {
        if (arg) {
            result += `${arg},`;
        }
    });
    if (method.args.length > 0) {
        result = result.substring(0, result.length - 1);
    }

    result += ')```';

    return result;
}

export function buildComputedDocumentation(computed: SvelteComputedItem) {
    if (!computed) {
        return null;
    }

    let result = '``` javascript\n';
    if (computed.description) {
        result += `/** ${computed.description} */\n`;
    }
    
    result += `${computed.name}`;

    if (computed.dependencies) {
        result += ': ({';
        computed.dependencies.forEach(dependency => {
            result += `${dependency}, `;
        });
        result = result.substring(0, result.length - 2);
        result += '})';
    }
    result += '```';

    return result;
}

export function buildPropertyDocumentation(property: SvelteDataItem) {
    if (!property) {
        return null;
    }

    let result = '``` javascript\n';
    if (property.description) {
        result += `/** ${property.description} */\n`;
    }
    
    result += `${property.name}`;
    if (property.type) {
        result += `: ${property.type.text}`;
    }

    if (property.value) {
        const valueType = typeof(property.value);
        if (valueType === 'string') {
            result += ` = '${property.value}'`;
        } else if (valueType === 'number' || valueType === 'boolean') {
            result += ` = ${property.value}`;
        }
    }

    result += '```';

    return result;
}

export function buildDocumentation(componentDoc: SvelteComponentDoc) {
    if (componentDoc === null || componentDoc === undefined) {
        return null;
    }

    let result = `Svelte component\n## ${componentDoc.name}\n`;

    if (componentDoc.description) {
        result += `${componentDoc.description}\n`;
    }
    
    result += '``` javascript\n';

    if (componentDoc.data) {
        const publicProperties = componentDoc.data.filter(p => p.visibility === 'public');
        if (publicProperties.length > 0) {
            publicProperties.forEach(property => {
                if (property.description) {
                    result += `/** ${property.description} */\n`;
                }
                result += `(data) ${property.name}: ${property.type.text}\n`;
            });
        }
    }

    if (componentDoc.events) {
        const publicEvents = componentDoc.events.filter(e => e.visibility === 'public');
        if (publicEvents.length > 0) {
            publicEvents.forEach(event => {
                if (event.description) {
                    result += `/** ${event.description} */\n`;
                }
                result += `(event) ${event.name}\n`;
            });
        }
    }

    if (componentDoc.slots) {
        const publicSlots = componentDoc.slots;
        if (publicSlots.length > 0) {
            publicSlots.forEach(slot => {
                if (slot.description) {
                    result += `/** ${slot.description} */\n`;
                }
                result += `(slot) ${slot.name}\n`;
            });
        }
    }

    result += '```';

    return result;
}