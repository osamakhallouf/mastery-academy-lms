import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const user = await currentUser();

        if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
            console.error("Unauthorized request:", user);
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const rate = rateLimit(`checkout:${user.id}`, {
            limit: 5,
            windowMs: 60 * 60 * 1000,
        });

        if (!rate.success) {
            return new NextResponse("Too many requests. Please try again later.", {
                status: 429,
            });
        }

        const course = await db.course.findUnique({
            where: {
                id: params.courseId,
                isPublished: true,
            }
        });

        if (!course) {
            console.error("Course not found:", params.courseId);
            return new NextResponse("Not found", { status: 404 });
        }

        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: params.courseId
                }
            }
        });

        if (purchase) {
            console.error("Purchase already exists:", user.id, params.courseId);
            return new NextResponse("Already purchased", { status: 400 });
        }

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                quantity: 1,
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: course.title,
                        description: course.description!,
                    },
                    unit_amount: Math.round(course.price! * 100),
                }
            }
        ];

        let stripeCustomer = await db.stripeCustomer.findUnique({
            where: {
                userId: user.id,
            },
            select: {
                StripeCustomerId: true,
            }
        });

        if (!stripeCustomer) {
            const customer = await stripe.customers.create({
                email: user.emailAddresses[0].emailAddress,
            });

            stripeCustomer = await db.stripeCustomer.create({
                data: {
                    userId: user.id,
                    StripeCustomerId: customer.id,
                }
            });
        }

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomer.StripeCustomerId,
            line_items,
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
            metadata: {
                courseId: course.id,
                userId: user.id,
            }
        });

        return NextResponse.json({ url: session.url });
        
    } catch (error) {
        console.error("Error during checkout process:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
