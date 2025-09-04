import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  Divider,
  FormHelperText,
  Collapse,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Signup = () => {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = (fieldValues = values) => {
    let validationErrors = { ...errors };

    if ("name" in fieldValues) {
      if (!fieldValues.name) {
        validationErrors.name = "Name is required";
      } else if (fieldValues.name.length < 2) {
        validationErrors.name = "Name must be at least 2 characters";
      } else {
        delete validationErrors.name;
      }
    }

    if ("email" in fieldValues) {
      if (!fieldValues.email) {
        validationErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(fieldValues.email)) {
        validationErrors.email = "Email is not valid";
      } else {
        delete validationErrors.email;
      }
    }

    if ("password" in fieldValues) {
      if (!fieldValues.password) {
        validationErrors.password = "Password is required";
      } else if (fieldValues.password.length < 6) {
        validationErrors.password = "Password must be at least 6 characters";
      } else {
        delete validationErrors.password;
      }
    }

    setErrors(validationErrors);
    return validationErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    validate({ [name]: value }); // validate live per field
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(values);

    if (Object.keys(validationErrors).length === 0) {
      console.log("Signup form submitted successfully", values);
      // TODO: call backend signup API here
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        px: 1,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: { xs: 2, sm: 4 },
          pb: 4,
          pt: 0,
          width: "100%",
          maxWidth: { xs: "100%", sm: 500 },
        }}
      >
        <Typography variant="h4" sx={{ pt: 2 }}>
          TaskStream
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Name"
            name="name"
            margin="normal"
            value={values.name}
            onChange={handleInputChange}
            error={!!errors.name}
          />
          <Collapse in={!!errors.name} timeout={300}>
            <FormHelperText error>{errors.name}</FormHelperText>
          </Collapse>
          <TextField
            fullWidth
            label="Email"
            name="email"
            margin="normal"
            type="email"
            value={values.email}
            onChange={handleInputChange}
            error={!!errors.email}
          />
          <Collapse in={!!errors.email} timeout={300}>
            <FormHelperText error>{errors.email}</FormHelperText>
          </Collapse>
          <TextField
            fullWidth
            label="Password"
            name="password"
            margin="normal"
            type="password"
            value={values.password}
            onChange={handleInputChange}
            error={!!errors.password}
          />
          <Collapse in={!!errors.password} timeout={300}>
            <FormHelperText error>{errors.password}</FormHelperText>
          </Collapse>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;
