import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../errorHandler";
import mongoose from "mongoose";

describe("ErrorHandler Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should handle mongoose validation errors", () => {
    const validationError = new mongoose.Error.ValidationError();
    errorHandler(
      validationError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Validation failed",
    });
  });

  it("should handle mongoose cast errors", () => {
    const castError = new mongoose.Error.CastError(
      "ObjectId",
      "invalid-id",
      "userId"
    );
    errorHandler(
      castError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid ID format",
    });
  });

  it("should handle JWT errors", () => {
    const jwtError = new Error("Invalid token");
    jwtError.name = "JsonWebTokenError";
    errorHandler(
      jwtError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });
  });

  it("should handle token expiration errors", () => {
    const tokenError = new Error("Token expired");
    tokenError.name = "TokenExpiredError";
    errorHandler(
      tokenError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Token expired",
    });
  });

  it("should handle unknown errors with 500 status", () => {
    const unknownError = new Error("Unknown error");
    errorHandler(
      unknownError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Unknown error",
    });
  });

  it("should use default message for unknown errors without message", () => {
    const unknownError = new Error();
    errorHandler(
      unknownError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});
