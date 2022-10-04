import ReactSelect, { GroupBase, Props, ActionMeta } from "react-select";

function Select<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>
>(props: Props<Option, IsMulti, Group>): JSX.Element {
    return (
        <ReactSelect
            styles={{
                option: (provided, state) => ({
                    ...provided,
                    borderBottom: "1px dotted pink",
                    backgroundColor: "unset",
                    fontWeight: state.isSelected ? "bolder" : "initial",
                    color: state.isSelected ? "#fb8e84" : "#00000099",
                }),
            }}
            {...props}
        />
    );
}

export default Select;
