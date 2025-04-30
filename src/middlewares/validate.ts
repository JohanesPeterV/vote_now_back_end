import { RequestHandler } from "express";
import * as yup from "yup";

export const validate = (schema: yup.Schema): RequestHandler => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};
