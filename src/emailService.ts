// src/emailService.ts
import emailjs from "@emailjs/browser";

// EmailJS Configuration - Your credentials from the dashboard
const SERVICE_ID = "service_v9e17ok"; // Your service ID
const WELCOME_TEMPLATE_ID = "template_7ezp88c"; // Your actual welcome template ID
const ORDER_TEMPLATE_ID = "template_cyjo0pg"; // Your actual order template ID
const PUBLIC_KEY = "UAv9OEP5ymjNw_eNo"; // Your public key

// Initialize EmailJS with your public key
emailjs.init(PUBLIC_KEY);

export const sendWelcomeEmail = async (userName: string, userEmail: string) => {
  try {
    console.log("📧 Sending welcome email to:", userEmail);

    const templateParams = {
      to_name: userName,
      email: userEmail,
      message: `Welcome to Skull Cart! 🎉 We're excited to have you on board. Start shopping and discover amazing deals on tech gadgets and accessories!`,
      year: new Date().getFullYear(),
    };

    const response = await emailjs.send(
      SERVICE_ID,
      WELCOME_TEMPLATE_ID,
      templateParams
    );
    console.log("✅ Welcome email sent successfully!", response);
    return { success: true, response };
  } catch (error: any) {
    console.error("❌ Failed to send welcome email:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

export const sendOrderConfirmationEmail = async (orderDetails: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  paymentMethod: string;
  date: string;
}) => {
  try {
    const itemsList = orderDetails.items
      .map(
        (item) =>
          `${item.name} x${item.quantity} - ₹${(
            item.price * item.quantity
          ).toFixed(2)}`
      )
      .join(", ");

    const templateParams = {
      to_name: orderDetails.customerName,
      email: orderDetails.customerEmail,
      order_id: orderDetails.orderId,
      order_date: orderDetails.date,
      items: itemsList,
      total: orderDetails.total.toFixed(2),
      payment_method: orderDetails.paymentMethod.toUpperCase(),
      message: `Thank you for shopping with Skull Cart! Your order #${orderDetails.orderId} has been successfully placed. We'll notify you once it's shipped.`,
      year: new Date().getFullYear(),
    };

    const response = await emailjs.send(
      SERVICE_ID,
      ORDER_TEMPLATE_ID,
      templateParams
    );
    console.log("✅ Order confirmation email sent!", response);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to send order confirmation:", error);
    return { success: false, error: error.message };
  }
};
