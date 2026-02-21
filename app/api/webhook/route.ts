import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";


export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return apiError("Webhook signature verification failed", 400);
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;

  if (event.type === "checkout.session.completed") {
    if (!userId || !courseId) {
      return apiError("Missing metadata", 400);
    }

    const stripeSessionId = session.id;

    await db.$transaction(async (tx) => {
      const existingPurchase = await tx.purchase.findFirst({
        where: {
          OR: [
            { stripeSessionId },
            { userId, courseId },
          ],
        },
      });

      if (existingPurchase) {
        return;
      }

      await tx.purchase.create({
        data: {
          userId,
          courseId,
          stripeSessionId,
        },
      });
    });
  } else {
    return apiError(`Unhandled event type ${event.type}`, 200);
  }

  return new NextResponse(null, { status: 200 });
}
