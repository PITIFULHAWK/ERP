import prisma from "@repo/db";

export type CreatePaymentInput = {
    userId: string;
    type: "COURSE" | "HOSTEL";
    courseId?: string;
    hostelId?: string;
    amount: number;
    currency?: string;
    method?: "MANUAL" | "RAZORPAY" | "CARD" | "UPI";
    reference?: string;
    notes?: string;
};

export async function createPayment(input: CreatePaymentInput) {
    const {
        userId,
        type,
        courseId,
        hostelId,
        amount,
        currency = "INR",
        method = "MANUAL",
        reference,
        notes,
    } = input;

    if (amount <= 0) {
        throw new Error("Amount must be greater than zero");
    }

    if (type === "COURSE" && !courseId) {
        throw new Error("courseId is required for COURSE payments");
    }
    if (type === "HOSTEL" && !hostelId) {
        throw new Error("hostelId is required for HOSTEL payments");
    }

    const payment = await prisma.payment.create({
        data: {
            userId,
            type,
            courseId: type === "COURSE" ? courseId : null,
            hostelId: type === "HOSTEL" ? hostelId : null,
            amount,
            currency,
            method,
            status: "PENDING", // remains pending until admin verification
            reference,
            notes,
        },
    });

    return payment;
}

export async function getPaymentSummary(params: {
    userId: string;
}) {
    const { userId } = params;

    const [courseTotal, hostelTotal, coursePaidAgg, hostelPaidAgg] =
        await prisma.$transaction([
            prisma.course.aggregate({
                _sum: { totalFees: true },
                where: {
                    users: { some: { id: userId } },
                },
            }),
            prisma.hostel.aggregate({
                _sum: { fees: true },
                where: {
                    users: { some: { id: userId } },
                },
            }),
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: { userId, type: "COURSE", status: "SUCCESS" },
            }),
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: { userId, type: "HOSTEL", status: "SUCCESS" },
            }),
        ]);

    const totalCourseFees = courseTotal._sum.totalFees ?? 0;
    const totalHostelFees = hostelTotal._sum.fees ?? 0;
    const paidCourse = coursePaidAgg._sum.amount ?? 0;
    const paidHostel = hostelPaidAgg._sum.amount ?? 0;

    return {
        course: {
            total: totalCourseFees,
            paid: paidCourse,
            due: Math.max(0, totalCourseFees - paidCourse),
        },
        hostel: {
            total: totalHostelFees,
            paid: paidHostel,
            due: Math.max(0, totalHostelFees - paidHostel),
        },
    };
}

export async function listPayments(params: {
    userId?: string;
    type?: "COURSE" | "HOSTEL";
    status?: "PENDING" | "SUCCESS" | "FAILED";
    limit?: number;
}) {
    const { userId, type, status, limit = 50 } = params;
    return prisma.payment.findMany({
        where: {
            userId: userId ?? undefined,
            type: type ?? undefined,
            status: status ?? undefined,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { receipts: true },
    });
}

export async function createReceipt(input: {
    paymentId: string;
    uploadedById: string;
    mediaUrl: string;
    mediaType: string;
    notes?: string;
}) {
    const { paymentId, uploadedById, mediaUrl, mediaType, notes } = input;

    // ensure payment exists
    await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });

    return prisma.receipt.create({
        data: {
            paymentId,
            uploadedById,
            mediaUrl,
            mediaType,
            notes,
        },
    });
}

export async function verifyPayment(input: {
    paymentId: string;
    verified: boolean;
    adminId: string; // for audit (optional future use)
}) {
    const { paymentId, verified } = input;

    const status = verified ? "SUCCESS" : "FAILED";

    const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status },
    });

    // Update user's convenience flags only when successful
    if (payment.status === "SUCCESS") {
        if (payment.type === "COURSE") {
            await prisma.user.update({
                where: { id: payment.userId },
                data: { coursePayStatus: "VERIFIED" },
            });
        }
        if (payment.type === "HOSTEL") {
            await prisma.user.update({
                where: { id: payment.userId },
                data: { hostelPayStatus: "VERIFIED" },
            });
        }
    }

    return payment;
}


