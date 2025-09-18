import { Router } from "express";
import {
    getPayments,
    getPaymentById,
    getPaymentSummary,
    createPaymentWithReceipt,
    createPaymentSimple,
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
router.post("/", createPaymentSimple); // Simple JSON payment creation (user)
router.post("/create-with-receipt", uploadReceiptFile, handleMulterError, createPaymentWithReceipt); // Create payment with optional receipt
router.delete("/:id", deletePayment); // Delete payment
// Verification routes (Admin only)
router.patch("/:id/verify", verifyPayment); // Verify payment (Admin)

export default router;
