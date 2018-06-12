import React from 'react';
import { withFormik } from 'formik';
import { Button, CircularProgress } from 'react-md';
import EnhancedTextField from '../generic/EnhancedTextField';

const PureLoginForm = ({
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
    <div style={{ overflow: 'hidden' }}>
      {isSubmitting && (
        <CircularProgress
          centered={false}
          style={{ marginTop: '30px' }}
          id="registration-in-progress"
        />
      )}
      {!isSubmitting && (
        <Button
          type="submit"
          disabled={isSubmitting}
          flat
          primary
          swapTheming
          style={{ marginTop: '30px', float: 'right' }}
        >
          Login
        </Button>
      )}
      {/*!isSubmitting && (
        <span className="login-prompt">
          No account yet?<br />
          <Link to="/account/register">Register here.</Link>
        </span>
      )*/}
    </div>
  </form>
);

// Wrap our form with the using withFormik HoC
const LoginForm = withFormik({
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
  handleSubmit: (values, { props, setErrors, setSubmitting }) => {
    props.login(values, { props, setErrors, setSubmitting });
  }
})(PureLoginForm);

export default LoginForm;
