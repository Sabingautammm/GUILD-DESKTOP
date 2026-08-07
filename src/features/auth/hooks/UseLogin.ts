import { useState, type FormEvent } from "react";
import { login, type LoginPayload } from "../services/AuthApi";
import { ApiError } from "../../../services/api/Clint";
import { useToast } from "../../../components/toast/ToastProvider";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function useLogin(onSuccess: () => void) {
  const toast = useToast();
  const [values, setValues] = useState<LoginPayload>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: keyof LoginPayload, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!values.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!values.password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // toast.promise shows a pending toast immediately, then morphs it into
      // success (green) or error (red) based on how login() settles.
      await toast.promise(login(values), {
        loading: "Signing in\u2026",
        loadingDescription: "Talking to the server",
        success: "Signed in",
        successDescription: "Welcome back!",
        error: (err) =>
          err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      });
      onSuccess();
    } catch (err) {
      // The toast already told the user what went wrong — the only thing
      // left to do here is push field-level errors (e.g. wrong password)
      // under the right inputs, same as before.
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors((prev) => ({ ...prev, ...err.fieldErrors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, fieldErrors, isSubmitting, setField, handleSubmit };
}