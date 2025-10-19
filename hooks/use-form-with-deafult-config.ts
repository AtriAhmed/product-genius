import { useForm, UseFormReturn, FieldValues } from "react-hook-form";

export function useFormWithDefaultConfig<T extends FieldValues>(
  ...args: Parameters<typeof useForm<T>>
): UseFormReturn<T> {
  const methods = useForm<T>(...args);

  const setValue: typeof methods.setValue = (name, value, options = {}) => {
    return methods.setValue(name, value, {
      ...options,
      shouldDirty: true,
    });
  };

  return {
    ...methods,
    setValue,
  };
}
