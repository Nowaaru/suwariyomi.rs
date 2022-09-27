import * as MdIcons from "react-icons/md";

const allIcons = { ...MdIcons };

type SupportedIcon = keyof typeof allIcons;

type HasId<T> = T & { id: string };

type HasName<T> = T & { name?: string };

type Checked = "checked" | "unchecked";
type SearchFilterCheckbox = {
    type: "checkbox";
} & (
    | {
          allowIndeterminate: true;
          checked?: Checked | "indeterminate";

          checkboxValues?: {
              checked: unknown;
              indeterminate: unknown;
          };
          checkboxIcons?: {
              checked?: SupportedIcon;
              indeterminate?: SupportedIcon;
          };
      }
    | {
          allowIndeterminate: false;
          checked?: Checked;

          checkboxValues?: {
              checked: unknown;
              indeterminate?: never;
          };
          checkboxIcons?: {
              checked?: SupportedIcon;
              indeterminate?: never;
          };
      }
);

type SearchFilterDate = {
    type: "date";
    minDate?: Date;
    maxDate?: Date;
    selectedDate?: Date;
};

type SearchFilterSelect = {
    type: "select";
} & (
    | {
          allowMultiple?: true;
          selected?: Array<{ displayValue: unknown; value: unknown }>;
      }
    | { allowMultiple?: false | never; selected?: unknown }
);

type SearchFilterGroup = {
    type: "group" | "readonly";
    fields: Array<HasId<SearchFilters>>;
};

type SearchFilterText = {
    type: "text";

    placeholderValue?: string;
    value?: string;
};

export type SearchFilter = HasName<
    | SearchFilterCheckbox
    | SearchFilterSelect
    | SearchFilterDate
    | SearchFilterText
    | SearchFilterGroup
>;

export type SearchFilters = SearchFilter | Record<string, SearchFilter>;
