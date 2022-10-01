import { AllIcons } from "util/search";

type SupportedIcon = keyof typeof AllIcons;

export type HasId<T> = T & { id: string };

export type HasName<T> = T & { name?: string };

export enum FilterType {
    Checkbox = "checkbox",
    Readonly = "readonly",
    Date = "date",
    Select = "select",
    Group = "group",
    Text = "text",
}

type Checked = "checked" | "unchecked";
type SearchFilterCheckbox = {
    type: FilterType.Checkbox;
} & (
    | {
          allowIndeterminate: true;
          checked?: Checked | "indeterminate";

          checkboxValues?: {
              checked: unknown;
              indeterminate: unknown;
              unchecked: never;
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
              unchecked?: never;
          };
          checkboxIcons?: {
              checked?: SupportedIcon;
              indeterminate?: never;
          };
      }
);

type SearchFilterDate = {
    type: FilterType.Date;
    minDate?: Date;
    maxDate?: Date;
    selectedDate?: Date;
};

type SearchFilterSelect = {
    type: FilterType.Select;
} & (
    | {
          allowMultiple?: true;
          selected?: Array<{ displayValue: unknown; value: unknown }>;
      }
    | { allowMultiple?: false | never; selected?: unknown }
);

type SearchFilterGroup = {
    type: FilterType.Group | FilterType.Readonly;
    sorted?: boolean;
    fields: Array<HasId<SearchFilter>>;
};

type SearchFilterText = {
    type: FilterType.Text;

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

export type SearchFilters = Record<string, SearchFilter>;
