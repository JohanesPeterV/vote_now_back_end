import { Request, Response, NextFunction } from "express";
import { authorizeRole } from "../authorize";

describe("authorizeRole middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("should return 401 if user is not authenticated", () => {
    const middleware = authorizeRole("admin");
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Authentication required",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 403 if user role doesn't match required role", () => {
    mockRequest = {
      user: {
        userId: "123",
        email: "test@example.com",
        role: "user",
      },
    };

    const middleware = authorizeRole("admin");
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Insufficient permissions",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should call next() if user role matches required role", () => {
    mockRequest = {
      user: {
        userId: "123",
        email: "test@example.com",
        role: "admin",
      },
    };

    const middleware = authorizeRole("admin");
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
