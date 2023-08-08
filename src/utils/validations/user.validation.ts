import { object, string } from "yup";

const userSchema = object().shape({
  email: string().email("Email is invalid").required("Email is required"),
  password: string().required("Password is required"),
  name: string().required("Name is required"),
});

const loginSchema = object().shape({
  email: string().email("Email is invalid").required("Email is required"),
  password: string().required("password is required field"),
});

export { userSchema, loginSchema };
