import { EventListener } from "api-maker"
import { idForComponent, nameForComponent, Select } from "api-maker-inputs"
import InvalidFeedback from "./invalid-feedback"
import PropTypes from "prop-types"
import React from "react"

const inflection = require("inflection")

export default class ApiMakerBootstrapSelect extends React.Component {
  static propTypes = {
    attribute: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string]),
    description: PropTypes.node,
    id: PropTypes.string,
    includeBlank: PropTypes.bool,
    hint: PropTypes.node,
    hintBottom: PropTypes.node,
    label: PropTypes.node,
    labelContainerClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    wrapperClassName: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      validationErrors: []
    }
  }

  componentDidMount() {
    this.setForm()
  }

  componentDidUpdate() {
    this.setForm()
  }

  setForm() {
    const form = this.refs.select && this.refs.select.form
    if (form != this.state.form) this.setState({form})
  }

  render() {
    const { form, validationErrors } = this.state
    const {
      attribute,
      children,
      className,
      defaultValue,
      id,
      includeBlank,
      hint,
      hintBottom,
      label,
      labelContainerClassName,
      model,
      name,
      placeholder,
      options,
      wrapperClassName,
      ...restProps
    } = this.props

    return (
      <div className={this.wrapperClassName()}>
        {form && <EventListener event="validation-errors" onCalled={event => this.onValidationErrors(event)} target={form} />}
        {this.label() &&
          <div className={labelContainerClassName ? labelContainerClassName : null}>
            <label className={this.labelClassName()} htmlFor={this.inputId()}>
              {this.label()}
            </label>
          </div>
        }
        {description &&
          <div className="mb-4">
            {description}
          </div>
        }
        {hint &&
          <span className="font-smoothing font-xs form-text text-muted">
            {hint}
          </span>
        }
        <Select
          defaultValue={this.inputDefaultValue()}
          className={this.selectClassName()}
          id={this.inputId()}
          name={this.inputName()}
          ref="select"
          {...restProps}
        />
        {hintBottom &&
          <span className="form-text text-muted font-smoothing font-xs">
            {hintBottom}
          </span>
        }
        {validationErrors.length > 0 && <InvalidFeedback errors={validationErrors} />}
      </div>
    )
  }

  includeBlank() {
    if (this.props.includeBlank || !this.props.multiple) {
      return true
    } else {
      return false
    }
  }

  inputDefaultValue() {
    if ("defaultValue" in this.props) {
      return this.props.defaultValue
    } else if (this.props.selected) {
      return this.props.selected
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No attribute by that name: ${this.props.attribute}`)

      return this.props.model[this.props.attribute]()
    }
  }

  inputId() {
    return idForComponent(this)
  }

  inputName() {
    return nameForComponent(this)
  }

  label() {
    if ("label" in this.props) {
      return this.props.label
    } else if (this.props.model) {
      const attributeMethodName = inflection.camelize(this.props.attribute.replace(/_id$/, ""), true)
      return this.props.model.modelClass().humanAttributeName(attributeMethodName)
    }
  }

  labelClassName() {
    const classNames = ["form-group-label"]

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  onValidationErrors(event) {
    const validationErrors = event.detail.getValidationErrorsForInput(this.props.attribute, this.inputName())
    this.setState({validationErrors})
  }

  selectClassName() {
    const classNames = ["form-control"]

    if (this.props.className) classNames.push(this.props.className)

    if (this.state.validationErrors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
  }

  wrapperClassName() {
    const classNames = ["form-group", "component-bootstrap-select"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
