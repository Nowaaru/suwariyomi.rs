import ReactSelect, { GroupBase, Props } from "react-select";
import makeAnimated from "react-select/animated"
import _ from "lodash";


function Select<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>
>(
    props: Props<Option, IsMulti, Group>
): JSX.Element {
    return (
        <ReactSelect
            styles={{
                option: (provided, state) => ({
                    ...provided,
                    borderBottom: "1px dotted pink",
                    backgroundColor: "unset",
                    fontWeight: state.isSelected ? "bolder" : "initial",
                    color: state.isSelected ? "#fb8e84" : "#00000099",
                    ...(props.styles?.option?.({}, state) ?? {})
                }),
                ...(_.omit(props.styles ?? {}, "option")),
            }}
            {..._.omit(props, "styles")}
        />
    );
}

export default Select;
