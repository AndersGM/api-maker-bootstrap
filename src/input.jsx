import { Input, idForComponent, Money, nameForComponent } from "api-maker-inputs"
import { EventListener } from "api-maker"
import InvalidFeedback from "./invalid-feedback"
import PropTypes from "prop-types"
import React from "react"

export default class BootstrapStringInput extends React.Component {
  static propTypes = {
    append: PropTypes.node,
    attribute: PropTypes.string,
    className: PropTypes.string,
    currenciesCollection: PropTypes.array,
    currencyName: PropTypes.string,
    defaultValue: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.node]),
    hint: PropTypes.node,
    hintBottom: PropTypes.node,
    id: PropTypes.string,
    label: PropTypes.node,
    labelClassName: PropTypes.string,
    model: PropTypes.object,
    name: PropTypes.string,
    placeholder: PropTypes.node,
    small: PropTypes.bool,
    type: PropTypes.string,
    wrapperClassName: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      blankInputName: this.props.type == "file",
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
    const form = this.refs.input && this.refs.input.form
    if (form != this.state.form) this.setState({form})
  }

  render() {
    const { form, validationErrors } = this.state
    const {
      append,
      attribute,
      className,
      currenciesCollection,
      currencyName,
      defaultValue,
      hint,
      hintBottom,
      id,
      label,
      labelClassName,
      model,
      name,
      onChange,
      ...restProps
    } = this.props

    return (
      <div className={this.wrapperClassName()} ref="wrapper">
        {form && <EventListener event="validation-errors" onCalled={(event) => this.onValidationErrors(event)} target={form} />}
        {this.label() &&
          <label className={this.labelClassName()} htmlFor={this.inputId()}>
            {this.label()}
          </label>
        }
        {hint &&
          <span className="form-text text-muted font-smoothing font-xs">
            {hint}
          </span>
        }
        {this.inputType() == "textarea" &&
          <textarea
            className={this.inputClassName()}
            defaultValue={this.inputDefaultValue()}
            id={this.inputId()}
            name={this.inputName()}
            ref="input"
            {...restProps}
          />
        }
        {this.inputType() == "money" &&
          <Money
            attribute={attribute}
            currenciesCollection={currenciesCollection}
            currencyName={currencyName}
            model={model}
            name={name}
            className={this.inputClassName()}
            onChange={onChange}
            placeholder={placeholder}
            small={small}
            ref="money"
          />
        }
        {this.inputType() != "textarea" && this.inputType() != "money" &&
          <div className="input-group">
            {prepend &&
              <div className="input-group-prepend">
                <span className="input-group-text">
                  {prepend}
                </span>
              </div>
            }
            <ApiMakerInput
              attribute={attribute}
              className={this.inputClassName()}
              defaultValue={this.inputDefaultValue()}
              id={this.inputId()}
              model={model}
              name={this.inputName()}
              onChange={e => this.onInputChanged(e)}
              ref="input"
              type={this.inputType()}
              {...restProps}
            />
            {append &&
              <div className="input-group-append">
                <span className="input-group-text">
                  {append}
                </span>
              </div>
            }
            {validationErrors.length > 0 && <InvalidFeedback errors={validationErrors} />}
          </div>
        }
        {hintBottom &&
          <span className="form-text text-muted font-smoothing font-xs">
            {hintBottom}
          </span>
        }
      </div>
    )
  }

  inputClassName() {
    const classNames = ["form-control"]

    if (this.props.className)
      classNames.push(this.props.className)

    if (this.state.validationErrors.length > 0)
      classNames.push("is-invalid")

    return classNames.join(" ")
  }

  inputDefaultValue() {
    if ("defaultValue" in this.props) {
      return this.formatValue(this.props.defaultValue)
    } else if (this.props.model) {
      if (!this.props.model[this.props.attribute])
        throw new Error(`No such attribute: ${this.props.model.modelClassData().name}#${this.props.attribute}`)

      return this.formatValue(this.props.model[this.props.attribute]())
    }
  }

  formatValue(value) {
    // We need to use a certain format for datetime-local
    if (this.inputType() == "datetime-local" && value instanceof Date) {
      return I18n.strftime(value, "%Y-%m-%dT%H:%M:%S")
    } else if (this.inputType() == "date" && value instanceof Date) {
      return I18n.strftime(value, "%Y-%m-%d")
    }

    return value
  }

  inputId() {
    return idForComponent(this)
  }

  inputName() {
    if (this.state.blankInputName)
      return ""

    return nameForComponent(this)
  }

  inputType() {
    if (this.props.type) {
      return this.props.type
    } else {
      return "text"
    }
  }

  label() {
    if ("label" in this.props) {
      return this.props.label
    } else if (this.props.model) {
      return this.props.model.modelClass().humanAttributeName(this.props.attribute)
    }
  }

  labelClassName() {
    const classNames = []

    if (this.props.labelClassName)
      classNames.push(this.props.labelClassName)

    return classNames.join(" ")
  }

  onInputChanged(e) {
    const { onChange, type } = this.props

    if (type == "file") this.setState({blankInputName: this.getBlankInputName()})
    if (onChange) onChange(e)
  }

  // This fixes an issue in Firefox and ActiveStorage, where uploads would be a blank string if a file wasn't chosen
  getBlankInputName() {
    const value = this.refs.input.value
    return (this.props.type == "file" && value == "")
  }

  onValidationErrors(event) {
    const validationErrors = event.detail.getValidationErrorsForInput(this.props.attribute, this.inputName())
    this.setState({validationErrors})
  }

  wrapperClassName() {
    const classNames = ["form-group", "component-bootstrap-string-input"]

    if (this.props.wrapperClassName)
      classNames.push(this.props.wrapperClassName)

    return classNames.join(" ")
  }
}
