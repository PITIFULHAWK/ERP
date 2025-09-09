import { Request, Response } from "express";
import { asyncHandler } from "../middleware";
import { createPayment, getPaymentSummary, listPayments, createReceipt, verifyPayment } from "../services/paymentService";

export const submitPayment = asyncHandler(async (req: Request, res: Response) => {
    const payment = await createPayment(req.body);
    res.status(201).json({ success: true, message: "Payment recorded", data: payment });
});

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const summary = await getPaymentSummary({ userId });
    res.json({ success: true, message: "Payment summary", data: summary });
});

export const getPayments = asyncHandler(async (req: Request, res: Response) => {
    const { userId, type, status, limit } = req.query as { userId?: string; type?: "COURSE" | "HOSTEL"; status?: "PENDING" | "SUCCESS" | "FAILED"; limit?: string };
    const payments = await listPayments({ userId, type, status, limit: limit ? Number(limit) : undefined });
    res.json({ success: true, message: "Payments list", data: payments });
});

export const uploadReceipt = asyncHandler(async (req: Request, res: Response) => {
    const receipt = await createReceipt(req.body);
    res.status(201).json({ success: true, message: "Receipt uploaded", data: receipt });
});

export const setPaymentVerification = asyncHandler(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const { verified, adminId } = req.body as { verified: boolean; adminId: string };
    const payment = await verifyPayment({ paymentId, verified, adminId });
    res.json({ success: true, message: "Payment status updated", data: payment });
});


