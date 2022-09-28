import type { SearchFilters } from "types/search";

const getValue = (toQuery: SearchFilters) => {
    /* eslint-disable no-case-declarations */
    switch (toQuery.type) {
        case "readonly":
        case "group":
            const out: Record<string, unknown> = {};
            toQuery.fields.forEach(
                (value, key) => (out[value.id ?? key] = getValue(value))
            );

            return out;
        case "checkbox":
            const matchedValues =
                toQuery.checkboxValues ?? toQuery.allowIndeterminate
                    ? {
                          checked: 1,
                          indeterminate: 0,
                          unchecked: -1,
                      }
                    : { checked: 1, unchecked: 0 };

            if (toQuery.allowIndeterminate)
                matchedValues.indeterminate = matchedValues.indeterminate ?? 0;

            return matchedValues[toQuery.checked ?? "unchecked"];
        case "date":
            return toQuery.selectedDate;
        case "select":
            return toQuery.selected;
        case "text":
            return toQuery.value;
        default:
            throw new Error(`unknown type ${toQuery.type}`);
    }
};

export const generateTree = (
    searchFiltersBase: Record<string, SearchFilters>
) => {
    const out: Record<string, unknown> = {};
    Object.keys(searchFiltersBase).forEach(
        (k) => (out[k] = getValue(searchFiltersBase[k]))
    );

    return out;
};
