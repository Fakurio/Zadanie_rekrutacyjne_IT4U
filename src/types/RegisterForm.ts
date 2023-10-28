import { z } from "zod";

const FormSchemma = z.object({
  name: z.string().refine(
    (name) => {
      return name.trim().length > 0;
    },
    { message: "Pole obowiązkowe" }
  ),
  email: z.string().email({ message: "Podaj email w formacie dobry@email.pl" }),
  email_agreement: z.boolean().refine(
    (agreement) => {
      return agreement === true;
    },
    { message: "Pole obowiązkowe" }
  ),
  phone: z
    .object({
      value: z.string().refine(
        (phone) => {
          return phone.trim().length > 0 ? phone.length === 9 : true;
        },
        { message: "Podaj numer w formacie 123456789" }
      ),
      phone_agreement: z.boolean(),
      sms_agreement: z.boolean(),
    })
    .refine(
      (phone) => {
        return phone.value
          ? phone.phone_agreement || phone.sms_agreement
          : true;
      },
      { message: "Wybierz jedną z metod kontaktu" }
    ),
});

type FormData = z.infer<typeof FormSchemma>;

type FormErrors = {
  [key: string | number]: string;
  name: string;
  email: string;
  phone: string; // error: phone_value
  email_agreement: string;
  phone_agreement: string; //error: phone
};

export type { FormData, FormErrors };
export default FormSchemma;
