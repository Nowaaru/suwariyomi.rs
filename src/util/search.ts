import { FilterType, SearchFilter, SearchFilters} from "types/search";
import * as MdIcons from "react-icons/md";
import * as CkIcons from "@chakra-ui/icons";

export const AllIcons = { ...MdIcons, ...CkIcons };

const getValue = (toQuery: SearchFilter) => {
    /* eslint-disable no-case-declarations */
    switch (toQuery.type) {
        case FilterType.Readonly:
        case FilterType.Group:
            const out: Record<string, unknown> = {};
            toQuery.fields.forEach(
                (value, key) => (out[value.id ?? key] = getValue(value))
            );

            return out;
        case FilterType.Checkbox:
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
        case FilterType.Date:
            return toQuery.selectedDate;
        case FilterType.Select:
            return toQuery.selected;
        case FilterType.Text:
            return toQuery.value;
    }
};

export const generateTree = (
    searchFiltersBase: SearchFilters
) => {
    const out: Record<string, unknown> = {};
    Object.keys(searchFiltersBase).forEach(
        (k) => (out[k] = getValue(searchFiltersBase[k]))
    );

    return out;
};
