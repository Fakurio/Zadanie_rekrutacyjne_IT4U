import { Button, Container, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DOMPurify from "dompurify";
import type { FormData, FormErrors } from "../../types/RegisterForm";
import FormSchemma from "../../types/RegisterForm";
import { fromZodError } from "zod-validation-error";
import { useState, useEffect } from "react";
import "./RegisterForm.css";

const cleanFormData: FormData = {
  name: "",
  email: "",
  email_agreement: false,
  phone: {
    value: "",
    phone_agreement: false,
    sms_agreement: false,
  },
};

const cleanFormErrors: FormErrors = {
  name: "",
  email: "",
  email_agreement: "",
  phone: "",
  phone_agreement: "",
};

function RegisterForm() {
  const [formData, setFormData] = useState<FormData>(cleanFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>(cleanFormErrors);
  const [isMailCheckboxHidden, setIsMailCheckboxHidden] =
    useState<boolean>(true);
  const [isPhoneCheckboxHidden, setIsPhoneCheckboxHidden] =
    useState<boolean>(true);
  const [serverResponse, setServerResponse] = useState<string>("");
  const [serverError, setServerError] = useState<string>("");

  const validateEmail = (email: string) => {
    return FormSchemma.shape.email.safeParse(email).success;
  };

  const validatePhone = (phone: string) => {
    return phone
      ? FormSchemma.shape.phone.safeParse({
          value: phone,
          phone_agreement: true,
          sms_agreement: true,
        }).success
      : false;
  };

  useEffect(() => {
    if (validateEmail(formData.email)) {
      setIsMailCheckboxHidden(false);
    } else {
      setIsMailCheckboxHidden(true);
      setFormData({ ...formData, email_agreement: false });
    }
  }, [formData.email]);

  useEffect(() => {
    if (validatePhone(formData.phone.value)) {
      setIsPhoneCheckboxHidden(false);
    } else {
      setIsPhoneCheckboxHidden(true);
      setFormData((prevState) => ({
        ...prevState,
        phone: {
          ...prevState.phone,
          phone_agreement: false,
          sms_agreement: false,
        },
      }));
    }
  }, [formData.phone.value]);

  useEffect(() => {
    setFormErrors(cleanFormErrors);
    setServerResponse("");
    setServerError("");
  }, [formData]);

  const getErrorTestValue = () => {
    return Math.random() < 0.1 ? "error" : formData.email;
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newFormErrors = { ...cleanFormErrors };
    let parsedFormData = FormSchemma.safeParse(formData);

    if (!parsedFormData.success) {
      fromZodError(parsedFormData.error).details.forEach((error) => {
        switch (error.path.join("_")) {
          case "phone_value": {
            newFormErrors.phone = error.message;
            break;
          }
          case "phone": {
            newFormErrors.phone_agreement = error.message;
            break;
          }
          default: {
            newFormErrors[`${error.path.join("_")}`] = error.message;
            break;
          }
        }
      });
      setFormErrors(newFormErrors);
    } else {
      let payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone.value);
      payload.append("agreement_mail", formData.email_agreement ? "1" : "0");
      payload.append(
        "call_agreement",
        formData.phone.phone_agreement ? "1" : "0"
      );
      payload.append("sms_agreement", formData.phone.sms_agreement ? "1" : "0");
      payload.append("error_test", getErrorTestValue());

      fetch(
        " https://test8.it4u.company/sapi/modules/contact/form/40042ce28394dc369948c018b22c534d ",
        {
          method: "POST",
          body: payload,
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.result != "OK") {
            setServerError(data.error.error_test);
          } else {
            setServerResponse(DOMPurify.sanitize(data.content));
          }
        });
    }
  };

  return (
    <Container className="form-container px-5 py-4 ">
      <Form onSubmit={handleFormSubmit}>
        <Form.Control
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
          }}
          placeholder="IMIĘ I NAZWISKO"
          className="form__input"
        />
        {formErrors.name && <p className="form__error">{formErrors.name}</p>}

        <Form.Control
          type="text"
          placeholder="TELEFON"
          value={formData.phone.value}
          onChange={(e) => {
            setFormData((prevState) => ({
              ...prevState,
              phone: {
                ...prevState.phone,
                value: e.target.value,
              },
            }));
          }}
          className="form__input mt-4"
        />
        {formErrors.phone && <p className="form__error">{formErrors.phone}</p>}

        {serverResponse && (
          <div
            className="text-center mt-3"
            dangerouslySetInnerHTML={{ __html: serverResponse }}
          ></div>
        )}

        <Form.Control
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
          }}
          placeholder="EMAIL"
          className="form__input mt-4"
        />
        {formErrors.email && <p className="form__error">{formErrors.email}</p>}
        {serverError && <p className="form__error">{serverError}</p>}

        <p className="form__agreement mt-4">
          Wyrażam zgodę na otrzymywanie od Duda Development Sp. z o.o. SKA z
          siedzibą w Poznaniu ul. Macieja Palacza 144, 60-278 Poznań, informacji
          handlowej:
        </p>

        {!isMailCheckboxHidden && (
          <Form.Group>
            <Form.Check
              id="email"
              label="w formie elektronicznej (mail) na wskazany adres mailowy"
              checked={formData.email_agreement}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  email_agreement: e.target.checked,
                });
              }}
              className="form__checkbox"
            />
            {formErrors.email_agreement && (
              <p className="form__error">{formErrors.email_agreement}</p>
            )}
          </Form.Group>
        )}

        {!isPhoneCheckboxHidden && (
          <Form.Group>
            <Form.Check
              id="phone1"
              label="drogą telefoniczną na wskazany numer telefonu"
              checked={formData.phone.phone_agreement}
              onChange={(e) => {
                setFormData((prevState) => ({
                  ...prevState,
                  phone: {
                    ...prevState.phone,
                    phone_agreement: e.target.checked,
                  },
                }));
              }}
              className="form__checkbox"
            />
            <Form.Check
              id="phone2"
              label="w formie SMS, na udostępniony numer telefonu"
              checked={formData.phone.sms_agreement}
              onChange={(e) => {
                setFormData((prevState) => ({
                  ...prevState,
                  phone: {
                    ...prevState.phone,
                    sms_agreement: e.target.checked,
                  },
                }));
              }}
              className="form__checkbox"
            />
            <p className="form__error">{formErrors.phone_agreement}</p>
          </Form.Group>
        )}

        <Form.Group className="d-flex justify-content-center mt-4">
          <Button type="submit" className="form__submit">
            Wyślij
          </Button>
        </Form.Group>

        <div className="text-center mt-4">
          <a className="form__link" href="#">
            Kto będzie administratorem Twoich danych osobowych?
          </a>
        </div>
      </Form>
    </Container>
  );
}

export default RegisterForm;
