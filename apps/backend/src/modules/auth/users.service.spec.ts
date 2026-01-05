import { UsersService } from "./users.service";
import { UserRepository } from "../../domain/users/UserRepository";
import { User } from "../../domain/users/User";
import * as argon2 from "argon2";

describe("UsersService", () => {
  let usersService: UsersService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<UserRepository>;

    usersService = new UsersService(mockUserRepository);
  });

  const createMockUser = async (
    overrides: Partial<{
      id: string;
      email: string;
      password: string;
      role: "ADMIN" | "MANAGER" | "USER";
      status: "ACTIVE" | "DISABLED";
    }> = {}
  ): Promise<User> => {
    const password = overrides.password ?? "password123";
    const passwordHash = await argon2.hash(password);

    return new User({
      id: overrides.id ?? "user-123",
      email: overrides.email ?? "test@example.com",
      passwordHash,
      role: overrides.role ?? "ADMIN",
      status: overrides.status ?? "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe("validateCredentials", () => {
    it("should return user when credentials are valid", async () => {
      const user = await createMockUser({ password: "correctPassword" });
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await usersService.validateCredentials(
        "test@example.com",
        "correctPassword"
      );

      expect(result).toBe(user);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should return null when user not found", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await usersService.validateCredentials(
        "nonexistent@example.com",
        "password"
      );

      expect(result).toBeNull();
    });

    it("should return null when password is incorrect", async () => {
      const user = await createMockUser({ password: "correctPassword" });
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await usersService.validateCredentials(
        "test@example.com",
        "wrongPassword"
      );

      expect(result).toBeNull();
    });

    it("should return null when user is disabled", async () => {
      const user = await createMockUser({
        password: "correctPassword",
        status: "DISABLED",
      });
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await usersService.validateCredentials(
        "test@example.com",
        "correctPassword"
      );

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      const user = await createMockUser();
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await usersService.findById("user-123");

      expect(result).toBe(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
    });

    it("should return null when user not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await usersService.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      const user = await createMockUser();
      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await usersService.findByEmail("test@example.com");

      expect(result).toBe(user);
    });

    it("should return null when user not found", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await usersService.findByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create user with hashed password", async () => {
      const expectedUser = await createMockUser();
      mockUserRepository.create.mockResolvedValue(expectedUser);

      const result = await usersService.createUser(
        "new@example.com",
        "password123",
        "ADMIN"
      );

      expect(result).toBe(expectedUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@example.com",
          role: "ADMIN",
          passwordHash: expect.any(String),
        })
      );

      // Verify the password was hashed (not stored in plain text)
      const createCall = mockUserRepository.create.mock.calls[0][0];
      expect(createCall.passwordHash).not.toBe("password123");
      expect(await argon2.verify(createCall.passwordHash, "password123")).toBe(
        true
      );
    });
  });

  describe("hashPassword", () => {
    it("should hash password using argon2", async () => {
      const password = "mySecretPassword";
      const hash = await UsersService.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(await argon2.verify(hash, password)).toBe(true);
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const user1 = await createMockUser({
        id: "user-1",
        email: "user1@example.com",
      });
      const user2 = await createMockUser({
        id: "user-2",
        email: "user2@example.com",
      });
      mockUserRepository.findAll.mockResolvedValue([user1, user2]);

      const result = await usersService.findAll();

      expect(result).toEqual([user1, user2]);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });

    it("should return empty array when no users exist", async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await usersService.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("updateUser", () => {
    it("should update user properties", async () => {
      const updatedUser = await createMockUser({
        role: "MANAGER",
        status: "DISABLED",
      });
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await usersService.updateUser("user-123", {
        role: "MANAGER",
        status: "DISABLED",
      });

      expect(result).toBe(updatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith("user-123", {
        role: "MANAGER",
        status: "DISABLED",
      });
    });

    it("should update email", async () => {
      const updatedUser = await createMockUser({ email: "new@example.com" });
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await usersService.updateUser("user-123", {
        email: "new@example.com",
      });

      expect(result).toBe(updatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith("user-123", {
        email: "new@example.com",
      });
    });
  });

  describe("updatePassword", () => {
    it("should update password with hashed value", async () => {
      const updatedUser = await createMockUser();
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await usersService.updatePassword(
        "user-123",
        "newPassword123"
      );

      expect(result).toBe(updatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith("user-123", {
        passwordHash: expect.any(String),
      });

      // Verify the password was hashed
      const updateCall = mockUserRepository.update.mock.calls[0][1];
      expect(updateCall.passwordHash).not.toBe("newPassword123");
      expect(
        await argon2.verify(updateCall.passwordHash!, "newPassword123")
      ).toBe(true);
    });
  });

  describe("deleteUser", () => {
    it("should delete user by id", async () => {
      mockUserRepository.delete.mockResolvedValue();

      await usersService.deleteUser("user-123");

      expect(mockUserRepository.delete).toHaveBeenCalledWith("user-123");
    });
  });
});
