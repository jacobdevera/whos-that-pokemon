import React from 'react';

/**
* A helper function to validate a value based on a hash of validations
* second parameter has format e.g., 
* {required: true, minLength: 5, email: true}
* (for required field, with min length of 5, and valid email)
*/
export function validate(value, validations) {
   var errors = { isValid: true, style: '' };

   if (value !== undefined) { // check validations
      // handle required
      if (validations.required && value === '') {
         errors.required = true;
         errors.isValid = false;
      }

      // handle minLength
      if (validations.minLength && value.length < validations.minLength) {
         errors.minLength = validations.minLength;
         errors.isValid = false;
      }

      // handle email type ??
      if (validations.email) {
         //pattern comparison from w3c
         //https://www.w3.org/TR/html-markup/input.email.html#input.email.attrs.value.single
         var valid = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
         if (!valid) {
            errors.email = true;
            errors.isValid = false;
         }
      }

      // handle password confirmation
      if (validations.password) {
         var confirm = (value === validations.password);
         if (!confirm) {
            errors.isValid = false;
            errors.confirm = true;
         }
      }
   }

   if (!errors.isValid) {
      errors.style = 'has-error';
   }
   else if (value !== undefined) { // valid and has input
      //errors.style = 'has-success' // show success coloring
   }
   else { // valid and no input
      errors.isValid = false; // make false anyway
   }
   return errors;
}

// A component that displays an input form with validation styling
// props are: field, type, label, changeCallback, errors
class ValidatedInput extends React.Component {
   render() {
      return (
         <div className={"form-group " + this.props.errors.style}>
            <label htmlFor={this.props.field} className="control-label">{this.props.label}</label>
            <input id={this.props.field} type={this.props.type} name={this.props.field} className="form-control" onChange={this.props.changeCallback} />
            <ValidationErrors errors={this.props.errors} />
         </div>
      );
   }
}

// a component to represent and display validation errors
class ValidationErrors extends React.Component {
   render() {
      return (
         <div>
            {this.props.errors.required &&
               <p className="help-block">Required!</p>
            }
            {this.props.errors.email &&
               <p className="help-block">Not an email address!</p>
            }
            {this.props.errors.minLength &&
               <p className="help-block">Must be at least {this.props.errors.minLength} characters.</p>
            }
            {this.props.errors.confirm &&
               <p className="help-block">Passwords must match.</p>
            }
         </div>
      );
   }
}

export { ValidatedInput, ValidationErrors };
export default validate;