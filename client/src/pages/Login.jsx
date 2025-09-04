import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Login = () => {
  const [loginPayload, setLoginPayload] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = (fieldValues = loginPayload) => {
    let validationErrors = { ...errors };

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
    const newValues = { ...loginPayload, [name]: value };
    setLoginPayload(newValues);
    validate({ [name]: value }); // validate live per field
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(loginPayload);

    if (Object.keys(validationErrors).length === 0) {
      console.log("Form submitted successfully", loginPayload);
      // TODO: call backend login API here
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
          Login
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email"
            name="email"
            margin="normal"
            type="email"
            value={loginPayload.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            margin="normal"
            type="password"
            value={loginPayload.password}
            onChange={handleInputChange}
            error={!!errors.password}
            helperText={errors.password}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Don't have an account?{" "}
          <Link component={RouterLink} to="/signup">
            Sign Up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
