import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const router : Router= Router();

// Public routes (in real app, you'd want authentication)
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);

// User management routes
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
