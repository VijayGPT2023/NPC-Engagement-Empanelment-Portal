import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { log } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    log("warn", "Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify HMAC SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      log("warn", "Razorpay webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    log("info", `Razorpay webhook received: ${event.event}`, { eventId: event.id });

    // Handle different event types
    switch (event.event) {
      case "payment.captured":
        // TODO: Process successful payment
        log("info", "Payment captured", { paymentId: event.payload?.payment?.entity?.id });
        break;
      case "payment.failed":
        log("warn", "Payment failed", { paymentId: event.payload?.payment?.entity?.id });
        break;
      default:
        log("info", `Unhandled Razorpay event: ${event.event}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    log("error", "Razorpay webhook processing error", { error: String(error) });
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }
}
