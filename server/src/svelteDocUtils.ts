export function buildDocumentation(componentDoc) {
    if (componentDoc == null) {
        return null;
    }

    let result = 
`#${componentDoc.name}
${componentDoc.description}\n`;

    if (componentDoc.data) {
        const publicProperties = componentDoc.data.filter(p => p.visibility === 'public');
        if (publicProperties.length > 0) {
            result += `\n## Data`;

            publicProperties.forEach(property => {
                result += `@type {\`${property.type}\`} ${property.name}`
                if (property.description) {
                    result += ` ${property.description}`
                }
                result += '\n';
            });
        }
    }

    if (componentDoc.events) {
        const publicEvents = componentDoc.events.filter(e => e.visibility === 'public');
        if (publicEvents.length > 0) {
            result += `\n## Events`;

            publicEvents.forEach(event => {
                result += `@event \`${event.name}\``;
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
            result += `\n## Slots`;

            publicSlots.forEach(slot => {
                result += `@slot ${slot.name}`;
                if (slot.description) {
                    result += ` ${slot.description}`;
                }
                result += '\n';
            });
        }
    }

    return result;
}