import { Router } from "express";
import {
    getPayments,
    getPaymentById,
    getPaymentSummary,
    createPayment,
    uploadReceipt,
    verifyPayment,
    deletePayment,
} from "../controllers/paymentController";
import {
    uploadSingle,
    uploadReceiptFile,
    handleMulterError,
} from "../middleware/upload";

const router: Router = Router();

// Payment routes
router.get("/", getPayments); // Get all payments (Admin view)
router.get("/summary", getPaymentSummary); // Get payment statistics
router.get("/:id", getPaymentById); // Get payment by ID
router.post("/", createPayment); // Create payment (User)
router.delete("/:id", deletePayment); // Delete payment

// Receipt routes
router.post("/receipts", uploadReceiptFile, handleMulterError, uploadReceipt); // Upload receipt with file

// Verification routes (Admin only)
router.patch("/:id/verify", verifyPayment); // Verify payment (Admin)

export default router;
