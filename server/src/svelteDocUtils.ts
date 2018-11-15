export function buildDocumentation(componentDoc) {
    if (componentDoc == null) {
        return null;
    }

    let result = `## Svelte component: ${componentDoc.name}\n`;

    if (componentDoc.description) {
        result += `${componentDoc.description}\n`;
    }

    if (componentDoc.data) {
        const publicProperties = componentDoc.data.filter(p => p.visibility === 'public');
        if (publicProperties.length > 0) {
            result += `\n### Data\n`;

            publicProperties.forEach(property => {
                result += `- {\`${getPropertyType(property)}\`} **${property.name}**`;
                if (property.description) {
                    result += ` ${property.description}`;
                }
                result += '\n';
            });
        }
    }

    if (componentDoc.events) {
        const publicEvents = componentDoc.events.filter(e => e.visibility === 'public');
        if (publicEvents.length > 0) {
            result += `\n### Events\n`;

            publicEvents.forEach(event => {
                result += `- **${event.name}**`;
                if (event.description) {
                    result += ` ${event.description}`;
                }
                result += `\n`;
            });
        }
    }

    if (componentDoc.slots) {
        const publicSlots = componentDoc.slots.filter(e => e.visibility === 'public');
        if (publicSlots.length > 0) {
            result += `\n### Slots\n`;

            publicSlots.forEach(slot => {
                result += `- **${slot.name}**`;
                if (slot.description) {
                    result += ` ${slot.description}`;
                }
                result += '\n';
            });
        }
    }

    return result;
}

function getPropertyType(property) {
    // Try to parse JS type
    const jsdocType = property.keywords.find(kw => kw.name === 'type');

    if (jsdocType) {
        const RE_JSDOC_TYPE = /(?:{([^}]*)})?(.*)/gim;
        const m = RE_JSDOC_TYPE.exec(jsdocType.description);

        if (m) {
            return m[1];
        }
    }

    // Try to parse node value
    if (property.value !== null) {
        return typeof(property.value);
    }

    // As a fallback, just use an generic object
    return 'object';
}