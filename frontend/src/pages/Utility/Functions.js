const setErrorFn = (e, setErrorOccurred, setError) => {
    setErrorOccurred(true)
    const errors = [];
    Object.keys(e.response.data).forEach(x => {
        errors.push(`${x.toUpperCase()}: ${e.response.data[x]}`);
    });
    setError(errors.join(", "));
}

const validateRequiredFields = (isDraft) => {
    const draftNotRequiredFields = document.querySelectorAll(".draftNotRequired");
    const requiredFields = document.querySelectorAll(".required");
    const isInvalidForm = Array.from(requiredFields).some((field) => !field.value);
    const errorFields = [];

    requiredFields.forEach((field) => {
      if (!field.value) {
        // field.classList.add("is-invalid");
        field.style.border = "1px solid red";
        errorFields.push(field);
      } else {
        // field.classList.remove("is-invalid");
        field.style.border = "1px solid #ced4da";
      }
    });

    draftNotRequiredFields.forEach((field) => {
      if (!field.value && !isDraft) {
        errorFields.push(field);
        // field.classList.add("is-invalid");
        field.style.border = "1px solid red";
      } else {
        // field.classList.remove("is-invalid");
        field.style.border = "1px solid #ced4da";
      }
    });

    return isInvalidForm, errorFields;
}

export { setErrorFn, validateRequiredFields };