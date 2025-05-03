import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "../authenticate";

describe("authenticateJWT middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("should return 401 if no token is provided", () => {
    authenticateJWT(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No token provided",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", () => {
    mockRequest = {
      headers: {
        authorization: "Bearer invalid.token.here",
      },
    };

    authenticateJWT(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should call next() if token is valid", () => {
    const payload = { userId: "123", email: "test@example.com", role: "user" };
    const token = jwt.sign(payload, process.env.JWT_SECRET!);

    mockRequest = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    authenticateJWT(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();

    expect(mockRequest.user).toMatchObject(payload);
  });
});
