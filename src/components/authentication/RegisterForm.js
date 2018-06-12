import React from 'react';
import { withFormik } from 'formik';
import { Button, CircularProgress } from 'react-md';
import EnhancedTextField from '../generic/EnhancedTextField';

const PureRegisterForm = ({
  values,
  errors,
  touched,
  setFieldValue,
  setFieldTouched,
  handleSubmit,
  isSubmitting
}) => (
  <form
    onSubmit={handleSubmit}
    style={{ minWidth: '300px', textAlign: 'left' }}
  >
    <div style={{ padding: '0 20%' }}>
      <EnhancedTextField
        type="email"
        fieldname="email"
        label="Email"
        onChange={setFieldValue}
        onBlur={setFieldTouched}
        error={errors.email}
        touched={touched.email}
      />
      <EnhancedTextField
        type="password"
        fieldname="password"
        label="Password"
        onChange={setFieldValue}
        onBlur={setFieldTouched}
        error={errors.password}
        touched={touched.password}
      />
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: '60px'
      }}
    >
      {isSubmitting && (
        <CircularProgress
          centered={false}
          style={{ margin: '0 24px 0 0' }}
          id="registration-in-progress"
        />
      )}
      {/*!isSubmitting && (
        <span className="register-prompt">
          Have an account?<br />
          <Link to="/account/login">Login here.</Link>
        </span>
      )*/}
      <Button
        type="submit"
        disabled={isSubmitting}
        className={isSubmitting ? 'disabled-button' : ''}
        flat
        primary
        swapTheming
      >
        Continue
      </Button>
    </div>
  </form>
);

// Wrap our form with the using withFormik HoC
const RegisterForm = withFormik({
  // Transform outer props into form values
  mapPropsToValues: props => ({ email: '', password: '' }),
  // Add a custom validation function (this can be async too!)
  validate: (values, props) => {
    let errors = {};
    if (!values.email) {
      errors.email = 'Required';
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
    ) {
      errors.email = 'Invalid email address';
    }
    return errors;
  },
  // Submission handler
  handleSubmit: (values, { props, setErrors }) => {
    //, setSubmitting
    props.register(values, { props, setErrors }); //, setSubmitting
  }
})(PureRegisterForm);

export default RegisterForm;
